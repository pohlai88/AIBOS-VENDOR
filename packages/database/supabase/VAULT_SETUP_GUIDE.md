# Supabase Vault Setup Guide

**Date:** 2025-01-27  
**Purpose:** Complete guide for setting up and managing Supabase Vault secrets  
**Status:** ✅ **READY TO USE**

---

## Overview

Supabase Vault is a secure way to store secrets (API keys, URLs, etc.) directly in your database. Secrets are encrypted at rest and can only be decrypted by authorized database functions.

**Why Use Vault:**
- ✅ Secrets encrypted at rest
- ✅ Accessible from SQL functions and triggers
- ✅ No need to pass secrets through environment variables
- ✅ Secure for pg_net triggers and Edge Function calls

---

## Required Secrets

For the pg_net triggers to work, you need to store these secrets:

### **1. project_url** (Required)
Your Supabase project URL (e.g., `https://your-project-ref.supabase.co`)

### **2. anon_key** (Required)
Your Supabase anon/public key (starts with `eyJ...`)

### **3. service_role_key** (Optional)
Your Supabase service role key (for Edge Functions that need elevated permissions)

---

## Setup Methods

### **Method 1: Using Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Database** → **Vault** (or **Settings** → **Vault**)
4. Click **"Create Secret"**
5. For each secret:
   - **Name:** `project_url`
   - **Value:** `https://your-project-ref.supabase.co`
   - **Description:** `Supabase project URL for Edge Function calls`
   - Click **"Create"**

Repeat for:
- **Name:** `anon_key`
- **Value:** Your anon key (from Settings → API)

- **Name:** `service_role_key` (optional)
- **Value:** Your service role key (from Settings → API)

---

### **Method 2: Using SQL (Alternative)**

Run these commands in Supabase SQL Editor:

```sql
-- 1. Store project URL
SELECT vault.create_secret(
  'https://your-project-ref.supabase.co',
  'project_url',
  'Supabase project URL for Edge Function calls'
);

-- 2. Store anon key
SELECT vault.create_secret(
  'your-anon-key-here',
  'anon_key',
  'Supabase anon/public key for API authentication'
);

-- 3. Store service role key (optional)
SELECT vault.create_secret(
  'your-service-role-key-here',
  'service_role_key',
  'Supabase service role key for elevated permissions'
);
```

**Get your keys from:**
- Supabase Dashboard → Settings → API
- Copy the **anon public** key and **service_role** key

---

## Verification

### **Check if Secrets Exist:**

```sql
-- List all secret names (metadata only)
SELECT * FROM list_vault_secret_names();

-- Check if specific secrets exist
SELECT vault_secret_exists('project_url') as has_project_url;
SELECT vault_secret_exists('anon_key') as has_anon_key;
SELECT vault_secret_exists('service_role_key') as has_service_key;

-- Validate complete setup
SELECT * FROM validate_vault_setup();
```

### **Expected Output:**

```
secret_name       | exists | status
------------------+--------+------------------
project_url       | true   | ✅ Configured
anon_key          | true   | ✅ Configured
service_role_key  | true   | ✅ Configured (Optional)
```

---

## Using Secrets in Functions

### **Helper Functions Available:**

1. **`get_project_url()`** - Returns project URL
2. **`get_anon_key()`** - Returns anon key
3. **`get_service_role_key()`** - Returns service role key
4. **`get_vault_secret(name)`** - Generic function to get any secret
5. **`get_edge_function_url(function_name)`** - Constructs Edge Function URL

### **Example Usage:**

```sql
-- In a trigger function
DECLARE
  function_url TEXT;
  anon_key TEXT;
BEGIN
  function_url := get_edge_function_url('payment-webhook');
  anon_key := get_anon_key();
  
  IF function_url IS NOT NULL AND anon_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object('data', 'value')
    );
  END IF;
END;
```

---

## Updating Secrets

### **Update via Dashboard:**
1. Go to **Database** → **Vault**
2. Find the secret
3. Click **"Edit"**
4. Update the value
5. Click **"Save"**

### **Update via SQL:**

```sql
-- Get secret ID first
SELECT id, name FROM vault.secrets WHERE name = 'anon_key';

-- Update secret (replace UUID with actual ID)
SELECT vault.update_secret(
  'secret-uuid-here',
  'new-value-here',
  'anon_key',  -- name
  'Updated description'  -- description
);
```

---

## Security Best Practices

### **1. Access Control**
- Only `postgres` role and service role should access Vault
- Regular users should NOT have access to `vault.decrypted_secrets` view
- Use `SECURITY DEFINER` functions to access secrets

### **2. Secret Rotation**
- Rotate secrets periodically (especially API keys)
- Update Vault secrets when rotating
- Test triggers after rotation

### **3. Audit**
- Monitor access to Vault secrets
- Log secret updates
- Review who has access to Vault

### **4. Backup**
- Vault secrets are included in database backups
- Secrets remain encrypted in backups
- Test restore process

---

## Troubleshooting

### **Problem: Triggers not firing**

**Check:**
```sql
-- Verify secrets exist
SELECT * FROM validate_vault_setup();

-- Test helper functions
SELECT get_project_url() as project_url;
SELECT get_anon_key() as anon_key;
```

**Solution:** Ensure all required secrets are stored in Vault.

---

### **Problem: "Secret not found" error**

**Check:**
```sql
-- List all secrets
SELECT name, created_at FROM vault.secrets WHERE name IS NOT NULL;
```

**Solution:** Verify secret names match exactly (case-sensitive).

---

### **Problem: Cannot decrypt secrets**

**Check:**
```sql
-- Verify Vault extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'supabase_vault';
```

**Solution:** Ensure `supabase_vault` extension is enabled.

---

## Quick Setup Script

Run this in Supabase SQL Editor after getting your credentials:

```sql
-- Quick setup (replace with your actual values)
DO $$
BEGIN
  -- Store project URL
  IF NOT vault_secret_exists('project_url') THEN
    PERFORM vault.create_secret(
      'https://your-project-ref.supabase.co',
      'project_url',
      'Supabase project URL'
    );
    RAISE NOTICE 'Created project_url secret';
  END IF;
  
  -- Store anon key
  IF NOT vault_secret_exists('anon_key') THEN
    PERFORM vault.create_secret(
      'your-anon-key-here',
      'anon_key',
      'Supabase anon key'
    );
    RAISE NOTICE 'Created anon_key secret';
  END IF;
  
  -- Validate setup
  RAISE NOTICE 'Vault setup complete. Validation:';
  PERFORM * FROM validate_vault_setup();
END $$;
```

---

## Next Steps

After setting up Vault:

1. ✅ **Verify secrets are stored:**
   ```sql
   SELECT * FROM validate_vault_setup();
   ```

2. ✅ **Test trigger functions:**
   - Update a payment status (should trigger webhook)
   - Upload a document (should trigger processing)

3. ✅ **Monitor pg_net requests:**
   ```sql
   SELECT * FROM net._http_response 
   WHERE created > NOW() - INTERVAL '1 hour'
   ORDER BY created DESC;
   ```

---

## Reference

- **Supabase Vault Docs:** https://supabase.com/docs/guides/database/vault
- **Helper Functions:** See migration `018_optimize_vault_setup.sql`
- **Trigger Functions:** See migration `015_enable_pg_net_and_triggers.sql`

---

*Guide created: 2025-01-27*
