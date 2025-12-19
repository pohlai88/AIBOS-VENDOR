# Testing Setup Guide

**Date:** 2025-01-27  
**Purpose:** Complete testing infrastructure for local and production databases

---

## Overview

This guide covers:
- Local testing setup
- Production testing strategies
- Test database configuration
- Integration testing
- E2E testing

---

## 1. Local Testing Setup

### 1.1 Supabase CLI Setup

**Install:**
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

**Initialize:**
```bash
cd packages/database/supabase
supabase init
```

**Start Local Supabase:**
```bash
supabase start
```

**Output:**
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

### 1.2 Environment Variables

**Create `.env.local`:**
```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>

# Test Database
TEST_SUPABASE_URL=http://localhost:54321
TEST_SUPABASE_ANON_KEY=<local-anon-key>
```

### 1.3 Running Migrations Locally

**Reset Database:**
```bash
supabase db reset
```

**Apply Specific Migration:**
```bash
supabase migration up <migration-name>
```

**Generate Types:**
```bash
supabase gen types typescript --local > ../../types/database.ts
```

---

## 2. Test Database Configuration

### 2.1 Test Data Seeding

**Create Seed File:**
```sql
-- packages/database/supabase/seed.sql

-- Create test tenant
INSERT INTO tenants (id, name, slug, status, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Tenant',
  'test-tenant',
  'active',
  'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- Create test company group
INSERT INTO company_groups (id, tenant_id, name)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Test Company Group'
) ON CONFLICT DO NOTHING;

-- Create test organizations
INSERT INTO organizations (id, tenant_id, company_group_id, name, type)
VALUES 
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Test Company',
    'company'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Test Vendor',
    'vendor'
  )
ON CONFLICT (id) DO NOTHING;

-- Create test users (requires auth.users first)
-- Note: Create auth users via Supabase Auth API in tests
```

**Load Seed Data:**
```bash
supabase db reset --seed
```

### 2.2 Test Helper Functions

**Create Test Utilities:**
```typescript
// tests/helpers/supabase.ts
import { createClient } from '@supabase/supabase-js';

export function createTestClient() {
  return createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_ANON_KEY!
  );
}

export async function createTestUser(email: string, password: string) {
  const supabase = createTestClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data.user!;
}

export async function createTestTenant(name: string, slug: string) {
  const supabase = createTestClient();
  const { data, error } = await supabase
    .from('tenants')
    .insert({ name, slug, status: 'active' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cleanupTestData() {
  const supabase = createTestClient();
  // Clean up test data
  await supabase.from('documents').delete().like('name', 'test-%');
  await supabase.from('organizations').delete().like('name', 'Test%');
  await supabase.from('tenants').delete().like('slug', 'test-%');
}
```

---

## 3. Unit Testing

### 3.1 Database Function Tests

**Example:**
```typescript
// tests/database/functions.test.ts
import { createTestClient } from '../helpers/supabase';

describe('Database Functions', () => {
  it('should get user tenant ID', async () => {
    const supabase = createTestClient();
    const { data, error } = await supabase.rpc('get_user_tenant_id', {
      user_id: 'test-user-id',
    });
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### 3.2 RLS Policy Tests

**Example:**
```typescript
// tests/rls/policies.test.ts
import { createTestClient, createTestUser, createTestTenant } from '../helpers/supabase';

describe('RLS Policies', () => {
  it('should enforce tenant isolation', async () => {
    // Create two tenants
    const tenant1 = await createTestTenant('Tenant 1', 'tenant-1');
    const tenant2 = await createTestTenant('Tenant 2', 'tenant-2');
    
    // Create users in different tenants
    const user1 = await createTestUser('user1@test.com', 'password123');
    const user2 = await createTestUser('user2@test.com', 'password123');
    
    // Create documents in tenant1
    const supabase1 = createTestClient();
    await supabase1.auth.signInWithPassword({
      email: 'user1@test.com',
      password: 'password123',
    });
    
    await supabase1.from('documents').insert({
      name: 'test-doc.pdf',
      tenant_id: tenant1.id,
      organization_id: 'test-org-id',
    });
    
    // User2 should not see tenant1 documents
    const supabase2 = createTestClient();
    await supabase2.auth.signInWithPassword({
      email: 'user2@test.com',
      password: 'password123',
    });
    
    const { data, error } = await supabase2
      .from('documents')
      .select('*')
      .eq('tenant_id', tenant1.id);
    
    expect(data).toHaveLength(0);
  });
});
```

---

## 4. Integration Testing

### 4.1 API Route Tests

**Example:**
```typescript
// tests/api/documents.test.ts
import { createTestClient, createTestUser } from '../helpers/supabase';

describe('Documents API', () => {
  it('should create document', async () => {
    const user = await createTestUser('test@example.com', 'password123');
    const supabase = createTestClient();
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });
    
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${await getAccessToken()}`,
      },
      body: JSON.stringify({
        name: 'test-document.pdf',
        type: 'invoice',
      }),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('test-document.pdf');
  });
});
```

### 4.2 Authentication Tests

**Example:**
```typescript
// tests/auth/signup.test.ts
import { createTestClient } from '../helpers/supabase';

describe('Authentication', () => {
  it('should sign up new user', async () => {
    const supabase = createTestClient();
    const { data, error } = await supabase.auth.signUp({
      email: 'newuser@test.com',
      password: 'password123',
    });
    
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe('newuser@test.com');
  });
  
  it('should assign tenant to new user', async () => {
    const supabase = createTestClient();
    const { data } = await supabase.auth.signUp({
      email: 'user@test.com',
      password: 'password123',
    });
    
    // Check user has tenant_id
    const { data: user } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', data.user!.id)
      .single();
    
    expect(user?.tenant_id).toBeDefined();
  });
});
```

---

## 5. E2E Testing

### 5.1 Playwright Setup

**Install:**
```bash
pnpm add -D @playwright/test
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.2 E2E Test Example

```typescript
// e2e/documents.spec.ts
import { test, expect } from '@playwright/test';

test('user can upload document', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to documents
  await page.goto('/documents');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/test-document.pdf');
  
  // Submit
  await page.click('button:has-text("Upload")');
  
  // Verify success
  await expect(page.locator('text=Document uploaded successfully')).toBeVisible();
});
```

---

## 6. Production Testing

### 6.1 Test Branch Strategy

**Using Supabase Branches:**
```typescript
// Create test branch
const branch = await createBranch({
  name: 'test-branch',
});

// Run tests against branch
const testClient = createClient(
  branch.project_url,
  branch.api_key
);

// Merge or delete after tests
await deleteBranch(branch.id);
```

### 6.2 Staging Environment

**Configuration:**
- Separate Supabase project for staging
- Same schema as production
- Test data only
- Automated cleanup

**Deployment:**
```bash
# Deploy to staging
supabase link --project-ref staging-project-ref
supabase db push

# Run tests
pnpm test:staging

# Cleanup
supabase db reset
```

---

## 7. Test Utilities

### 7.1 Test Data Factory

```typescript
// tests/factories/data.ts
export class TestDataFactory {
  static async createTenant(supabase: any, overrides = {}) {
    const { data } = await supabase
      .from('tenants')
      .insert({
        name: 'Test Tenant',
        slug: `test-${Date.now()}`,
        status: 'active',
        ...overrides,
      })
      .select()
      .single();
    return data;
  }
  
  static async createOrganization(supabase: any, tenantId: string, overrides = {}) {
    const { data } = await supabase
      .from('organizations')
      .insert({
        tenant_id: tenantId,
        name: 'Test Organization',
        type: 'company',
        ...overrides,
      })
      .select()
      .single();
    return data;
  }
  
  static async createUser(supabase: any, email: string, password: string) {
    const { data } = await supabase.auth.signUp({
      email,
      password,
    });
    return data.user;
  }
}
```

### 7.2 Test Cleanup

```typescript
// tests/helpers/cleanup.ts
export async function cleanupAll() {
  const supabase = createTestClient();
  
  // Delete in reverse order of dependencies
  await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Clean up auth users (requires service role)
  // Note: This should be done via admin API
}
```

---

## 8. CI/CD Testing

### 8.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start Supabase
        run: |
          supabase start
          supabase db reset
      
      - name: Run tests
        run: pnpm test
        env:
          TEST_SUPABASE_URL: http://localhost:54321
          TEST_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      
      - name: Stop Supabase
        run: supabase stop
```

---

## 9. Best Practices

### 9.1 Test Isolation

- Each test should be independent
- Clean up test data after each test
- Use unique identifiers (timestamps, UUIDs)
- Don't rely on test execution order

### 9.2 Test Data Management

- Use factories for creating test data
- Keep test data minimal
- Use transactions when possible
- Clean up in `afterEach` or `afterAll`

### 9.3 Performance Testing

- Test with realistic data volumes
- Monitor query performance
- Test RLS policy performance
- Load test critical endpoints

---

## 10. Running Tests

### Local Development

```bash
# Start Supabase
supabase start

# Run all tests
pnpm test

# Run specific test file
pnpm test tests/rls/policies.test.ts

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Production Testing

```bash
# Test against staging
pnpm test:staging

# Test against production (read-only)
pnpm test:production
```

---

## 11. Troubleshooting

### Common Issues

**Issue: Tests failing due to RLS**
- Solution: Use service role key for test setup
- Or: Create test users with proper tenant assignments

**Issue: Database not resetting**
- Solution: Use `supabase db reset` before tests
- Or: Use transactions and rollback

**Issue: Slow tests**
- Solution: Use test database instead of local
- Or: Parallelize tests
- Or: Mock external services

---

*Last updated: 2025-01-27*
