-- Multi-Tenant, Multi-Company Schema Migration
-- This migration adds tenant and company group support to the existing schema

-- ============================================================================
-- 1. TENANTS TABLE (Top-level tenant isolation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  max_users INTEGER DEFAULT 10,
  max_companies INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================================
-- 2. COMPANY GROUPS TABLE (Groups of companies within a tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_group_id UUID REFERENCES company_groups(id) ON DELETE SET NULL, -- For hierarchical groups
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(tenant_id, name) -- Unique name per tenant
);

CREATE INDEX idx_company_groups_tenant_id ON company_groups(tenant_id);
CREATE INDEX idx_company_groups_parent ON company_groups(parent_group_id);

-- ============================================================================
-- 3. UPDATE ORGANIZATIONS TABLE (Add tenant and company_group support)
-- ============================================================================
-- Add tenant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organizations' AND column_name = 'tenant_id') THEN
    ALTER TABLE organizations ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add company_group_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organizations' AND column_name = 'company_group_id') THEN
    ALTER TABLE organizations ADD COLUMN company_group_id UUID REFERENCES company_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make tenant_id NOT NULL after adding (if table is empty or we set defaults)
-- For existing data, we'll need to handle this carefully
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'organizations' AND column_name = 'tenant_id' AND is_nullable = 'YES') THEN
    -- Create a default tenant for existing organizations if needed
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'default') THEN
      INSERT INTO tenants (id, name, slug, status) 
      VALUES (gen_random_uuid(), 'Default Tenant', 'default', 'active')
      ON CONFLICT (slug) DO NOTHING;
    END IF;
    
    -- Update existing organizations to use default tenant
    UPDATE organizations 
    SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
    WHERE tenant_id IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE organizations ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_company_group_id ON organizations(company_group_id);

-- ============================================================================
-- 4. UPDATE USERS TABLE (Add tenant support)
-- ============================================================================
-- Add tenant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Set tenant_id from organization for existing users
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'users' AND column_name = 'tenant_id' AND is_nullable = 'YES') THEN
    UPDATE users u
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE u.organization_id = o.id
      AND u.tenant_id IS NULL;
    
    -- Make it NOT NULL
    ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- ============================================================================
-- 5. ADD TENANT_ID TO ALL EXISTING TABLES
-- ============================================================================

-- Documents
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'documents' AND column_name = 'tenant_id') THEN
    ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE documents d
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE d.organization_id = o.id;
    ALTER TABLE documents ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
  END IF;
END $$;

-- Statements
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'statements' AND column_name = 'tenant_id') THEN
    ALTER TABLE statements ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE statements s
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE s.organization_id = o.id;
    ALTER TABLE statements ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_statements_tenant_id ON statements(tenant_id);
  END IF;
END $$;

-- Payments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'tenant_id') THEN
    ALTER TABLE payments ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE payments p
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE p.organization_id = o.id;
    ALTER TABLE payments ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
  END IF;
END $$;

-- Message threads
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'message_threads' AND column_name = 'tenant_id') THEN
    ALTER TABLE message_threads ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE message_threads mt
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE mt.organization_id = o.id;
    ALTER TABLE message_threads ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_message_threads_tenant_id ON message_threads(tenant_id);
  END IF;
END $$;

-- Messages
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'tenant_id') THEN
    ALTER TABLE messages ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE messages m
    SET tenant_id = o.tenant_id
    FROM message_threads mt
    JOIN organizations o ON mt.organization_id = o.id
    WHERE m.thread_id = mt.id;
    ALTER TABLE messages ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
  END IF;
END $$;

-- Message attachments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'message_attachments' AND column_name = 'tenant_id') THEN
    ALTER TABLE message_attachments ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE message_attachments ma
    SET tenant_id = m.tenant_id
    FROM messages m
    WHERE ma.message_id = m.id;
    ALTER TABLE message_attachments ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_message_attachments_tenant_id ON message_attachments(tenant_id);
  END IF;
END $$;

-- Document access logs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_access_logs' AND column_name = 'tenant_id') THEN
    ALTER TABLE document_access_logs ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE document_access_logs dal
    SET tenant_id = d.tenant_id
    FROM documents d
    WHERE dal.document_id = d.id;
    ALTER TABLE document_access_logs ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_document_access_logs_tenant_id ON document_access_logs(tenant_id);
  END IF;
END $$;

-- Vendor relationships
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vendor_relationships' AND column_name = 'tenant_id') THEN
    ALTER TABLE vendor_relationships ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE vendor_relationships vr
    SET tenant_id = o.tenant_id
    FROM organizations o
    WHERE vr.company_id = o.id;
    ALTER TABLE vendor_relationships ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX idx_vendor_relationships_tenant_id ON vendor_relationships(tenant_id);
  END IF;
END $$;

-- ============================================================================
-- 6. ADD UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_groups_updated_at BEFORE UPDATE ON company_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HELPER FUNCTIONS FOR MULTI-TENANT
-- ============================================================================

-- Get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's company group (if organization belongs to one)
CREATE OR REPLACE FUNCTION get_user_company_group_id(user_id UUID)
RETURNS UUID AS $$
  SELECT o.company_group_id 
  FROM users u
  JOIN organizations o ON u.organization_id = o.id
  WHERE u.id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to tenant
CREATE OR REPLACE FUNCTION user_belongs_to_tenant(user_id UUID, check_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND tenant_id = check_tenant_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if organization belongs to tenant
CREATE OR REPLACE FUNCTION organization_belongs_to_tenant(org_id UUID, check_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = org_id AND tenant_id = check_tenant_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get all organizations in user's company group (if applicable)
CREATE OR REPLACE FUNCTION get_company_group_organizations(user_id UUID)
RETURNS TABLE(organization_id UUID) AS $$
  SELECT o.id
  FROM users u
  JOIN organizations o ON u.organization_id = o.id
  JOIN company_groups cg ON o.company_group_id = cg.id
  WHERE u.id = user_id
    AND o.tenant_id = (SELECT tenant_id FROM users WHERE id = user_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 8. ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE tenants IS 'Top-level tenant isolation for multi-tenant SaaS architecture';
COMMENT ON TABLE company_groups IS 'Groups of companies within a tenant (for enterprise customers with multiple subsidiaries)';
COMMENT ON COLUMN organizations.tenant_id IS 'Tenant that owns this organization';
COMMENT ON COLUMN organizations.company_group_id IS 'Company group this organization belongs to (optional)';
COMMENT ON COLUMN users.tenant_id IS 'Tenant that owns this user account';
