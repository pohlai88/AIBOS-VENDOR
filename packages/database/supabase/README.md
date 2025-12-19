# Database Setup

This directory contains Supabase database migrations and configuration.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Migrations

You can run migrations using the Supabase CLI or through the Supabase Dashboard:

#### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Using Supabase Dashboard

1. Go to SQL Editor in your Supabase Dashboard
2. Run each migration file in order:
   - `001_initial_schema.sql` - Core schema (11 tables)
   - `002_rls_policies.sql` - Security policies
   - `003_notifications.sql` - Notifications table
   - `004_user_preferences_and_activity.sql` - User preferences
   - `005_audit_logs.sql` - Audit logging
   - `006_sso_providers.sql` - SSO/SAML support
   - `007_webhooks.sql` - Webhook system
   - `008_data_retention.sql` - Data retention policies
   - `009_gdpr_compliance.sql` - GDPR compliance

### 3. Set Up Storage Buckets

Create storage buckets for documents:

```sql
-- Create documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Create storage policy for documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view accessible documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations
      WHERE id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    OR (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM vendor_relationships
      WHERE vendor_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
      AND status = 'active'
    )
  )
);

CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);
```

### 4. Enable Realtime

Enable Realtime for the messages table:

1. Go to Database > Replication in Supabase Dashboard
2. Enable replication for:
   - `messages` table
   - `message_threads` table

Or via SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
```

## Database Schema

The database includes the following tables:

### Core Tables (11)
- `organizations` - Company and vendor organizations
- `users` - User accounts (extends Supabase auth.users)
- `vendor_relationships` - Links vendors to company with roles/permissions
- `documents` - Shared documents with access control
- `statements` - Financial statements (vendor-specific + shared)
- `transactions` - Transaction records for statements
- `payments` - Payment records and history
- `message_threads` - Messaging threads between company and vendors
- `messages` - Individual messages
- `message_attachments` - File attachments for messages
- `document_access_logs` - Audit trail for document access

### Feature Tables (10)
- `notifications` - In-app notifications
- `user_preferences` - User notification preferences
- `user_activity_logs` - User activity tracking
- `audit_logs` - Comprehensive audit trail (enterprise)
- `sso_providers` - SSO/SAML provider configurations
- `sso_requests` - SSO login request tracking
- `webhooks` - Webhook configurations
- `webhook_deliveries` - Webhook delivery tracking
- `organization_retention_policies` - Data retention policies
- `privacy_consents` - GDPR privacy policy consents

**Total: 21 tables**

## Row Level Security (RLS)

All 21 tables have RLS enabled with comprehensive policies that ensure:
- Vendors can only see their own data + shared company documents
- Company users can see all vendor data within their organization
- Document access controlled by vendor_relationships and document metadata
- Admin users have appropriate override permissions
- System/service role can insert audit logs and webhook deliveries

**Total Policies:** 40+ comprehensive RLS policies

## Validation

The database configuration has been validated. See:
- `DATABASE_VALIDATION_REPORT.md` - Detailed validation report
- `VALIDATION_SUMMARY.md` - Quick validation summary

**Status:** ✅ Production Ready

