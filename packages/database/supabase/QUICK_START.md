# Supabase CLI Quick Start Guide

**Status:** ✅ Supabase CLI available via npx  
**Last Checked:** 2025-01-27

---

## ✅ Current Status

- ✅ **Supabase CLI:** Available via `npx supabase` (version 2.67.2)
- ✅ **Migrations:** 10 migration files ready
- ⚠️ **Connection:** Not yet linked to remote project

---

## Quick Connection Steps

### 1. Login to Supabase

```powershell
npx supabase login
```

This opens your browser to authenticate with Supabase.

### 2. Get Your Project Reference ID

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > General**
4. Copy the **Reference ID** (e.g., `abcdefghijklmn`)

### 3. Link to Remote Project

```powershell
cd packages/database/supabase
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference ID.

### 4. Push Migrations

```powershell
npx supabase db push
```

This applies all 10 migrations to your remote database.

---

## Automated Setup

Run the connection script:

```powershell
cd packages/database/supabase
.\CONNECT_TO_REMOTE.ps1
```

This script will guide you through the connection process.

---

## Verify Connection

After linking, verify the connection:

```powershell
# List remote tables
npx supabase db remote list

# Check migration status
npx supabase migration list

# Generate TypeScript types
npx supabase gen types typescript --linked > ../../src/schema.ts
```

---

## Common Commands

```powershell
# Login
npx supabase login

# Link to remote
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
npx supabase db push

# Pull remote schema
npx supabase db pull

# List remote tables
npx supabase db remote list

# Check migration status
npx supabase migration list

# Generate types
npx supabase gen types typescript --linked
```

---

## Troubleshooting

### "Not logged in"
```powershell
npx supabase login
```

### "Project not found"
- Verify project reference ID is correct
- Check you have access to the project in Supabase Dashboard

### "Migration failed"
- Check migration file syntax
- Ensure previous migrations were applied
- Review error messages for specific issues

---

## Next Steps After Connection

1. ✅ **Push Migrations**
   ```powershell
   npx supabase db push
   ```

2. ✅ **Set Up Storage**
   - Create documents bucket
   - Configure storage policies (see README.md)

3. ✅ **Enable Realtime**
   - Enable replication for `messages` and `message_threads` tables

4. ✅ **Configure Environment Variables**
   - Set `NEXT_PUBLIC_SUPABASE_URL`
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Set `SUPABASE_SERVICE_ROLE_KEY` (optional)

---

## Files Created

- ✅ `SUPABASE_CLI_SETUP.md` - Detailed setup guide
- ✅ `CONNECT_TO_REMOTE.ps1` - Automated connection script
- ✅ `INSTALL_SUPABASE_CLI.ps1` - Installation helper script
- ✅ `QUICK_START.md` - This file

---

*Ready to connect! Run `.\CONNECT_TO_REMOTE.ps1` to get started.*