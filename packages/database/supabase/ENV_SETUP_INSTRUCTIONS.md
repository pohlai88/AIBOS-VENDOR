# Environment Variables Setup - URGENT FIX

**Date:** 2025-01-27  
**Issue:** Missing `.env.local` file causing 500 error  
**Status:** ⚠️ **ACTION REQUIRED**

---

## 🔴 Error Found

**Error Message:**
```
Missing Supabase environment variables. Please check your .env.local file.
```

**This is causing the 500 error when testing OAuth!**

---

## ✅ Solution: Create `.env.local` File

### Step 1: Create File

**Create file:** `apps/web/.env.local`

### Step 2: Add These Variables

**Copy and paste this into `apps/web/.env.local`:**

```bash
# Supabase Configuration
# Generated: 2025-01-27

NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYXdjZXJ1em9reGl0eWJrdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTMxMzMsImV4cCI6MjA4MTM4OTEzM30.77ZTjHJdap0XGS2pi5FJqfdQDm6Tn9Fl1EptXQdertU
```

---

## Step 3: Restart Dev Server

**After creating the file:**

1. **Stop the current dev server** (Ctrl+C)
2. **Start it again:**
   ```bash
   cd apps/web
   npm run dev
   ```

**Or restart from root:**
```bash
pnpm dev
```

---

## Step 4: Test Again

**After restarting, test:**
```
http://localhost:3000/api/auth/oauth?provider=github
```

**Expected:**
- ✅ Should redirect to GitHub OAuth (not 500 error)

---

## Quick Copy-Paste

**File path:** `apps/web/.env.local`

**Content:**
```
NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYXdjZXJ1em9reGl0eWJrdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTMxMzMsImV4cCI6MjA4MTM4OTEzM30.77ZTjHJdap0XGS2pi5FJqfdQDm6Tn9Fl1EptXQdertU
```

---

**Last Updated:** 2025-01-27  
**Status:** ⚠️ **CREATE .env.local FILE**
