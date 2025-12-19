# Supabase Connection and Environment Setup - Complete

**Status:** ✅ Setup scripts and guides created  
**Date:** 2025-01-27

---

## ✅ What's Been Created

1. **`CONNECT_AND_SAVE_ENV.md`** - Complete step-by-step guide
2. **`SETUP_ENV_AND_CONNECT.ps1`** - Full interactive setup script
3. **`QUICK_CONNECT.ps1`** - Simplified quick connection script
4. **`.env.local.example`** - Template file (in `apps/web/`)

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Automated Script (Recommended)

```powershell
cd packages/database/supabase
.\SETUP_ENV_AND_CONNECT.ps1
```

This will guide you through:
- Login to Supabase
- Link to your project
- Enter credentials
- Save to `.env.local` automatically

### Method 2: Quick Connect Script

```powershell
cd packages/database/supabase
.\QUICK_CONNECT.ps1
```

Simpler version - just needs project ref and credentials.

### Method 3: Manual Steps

1. **Login:**
   ```powershell
   npx supabase login
   ```

2. **Link project:**
   ```powershell
   cd packages/database/supabase
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Get credentials from Supabase Dashboard:**
   - Go to: https://app.supabase.com → Settings → API
   - Copy: Project URL, anon key, service_role key

4. **Create `apps/web/.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## 📋 Required Environment Variables

Create `apps/web/.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get these:**
- **Project URL & Keys:** https://app.supabase.com → Your Project → Settings → API

---

## ✅ Verification Steps

After setup, verify:

1. **Check .env.local exists:**
   ```powershell
   Test-Path apps/web/.env.local
   ```

2. **Start dev server:**
   ```powershell
   pnpm dev
   ```

3. **Check for connection errors:**
   - Should connect to Supabase without errors
   - No "Missing environment variables" messages

---

## 📚 Documentation Files

- **`CONNECT_AND_SAVE_ENV.md`** - Detailed guide with troubleshooting
- **`QUICK_START.md`** - Quick reference for CLI commands
- **`SUPABASE_CLI_SETUP.md`** - Complete CLI installation guide
- **`CLI_STATUS.md`** - Current CLI status

---

## 🎯 Next Steps After Connection

1. ✅ **Push Migrations:**
   ```powershell
   cd packages/database/supabase
   npx supabase db push
   ```

2. ✅ **Verify Connection:**
   ```powershell
   npx supabase db remote list
   ```

3. ✅ **Start Development:**
   ```powershell
   pnpm dev
   ```

---

## ⚠️ Important Notes

- ✅ `.env.local` is in `.gitignore` - won't be committed
- ✅ Never commit credentials to git
- ✅ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep secret!
- ✅ Use `NEXT_PUBLIC_*` variables for client-side (safe to expose)

---

## 🆘 Need Help?

1. Check `CONNECT_AND_SAVE_ENV.md` for detailed troubleshooting
2. Verify Supabase CLI is working: `npx supabase --version`
3. Ensure you're logged in: `npx supabase login`
4. Check project access in Supabase Dashboard

---

*Ready to connect! Run `.\SETUP_ENV_AND_CONNECT.ps1` to get started.*