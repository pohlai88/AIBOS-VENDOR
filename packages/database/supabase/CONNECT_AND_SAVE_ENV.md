# Connect to Supabase and Save Environment Variables

**Quick Guide:** Connect to Supabase and save credentials to `.env.local`

---

## Step-by-Step Instructions

### Step 1: Login to Supabase CLI

Open PowerShell or Terminal and run:

```powershell
cd packages/database/supabase
npx supabase login
```

This will:
- Open your browser
- Prompt you to log in to Supabase
- Authorize the CLI

**Alternative:** Use access token:
```powershell
npx supabase login --token your-access-token
```
Get token from: https://app.supabase.com/account/tokens

---

### Step 2: Get Your Project Reference ID

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > General**
4. Copy the **Reference ID** (e.g., `abcdefghijklmn`)

---

### Step 3: Link to Remote Project

```powershell
cd packages/database/supabase
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference ID.

---

### Step 4: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > API**
4. Copy the following:
   - **Project URL** (e.g., `https://abcdefghijklmn.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`, keep this secret!)

---

### Step 5: Save Environment Variables

Create or update `apps/web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**File Location:** `apps/web/.env.local`

**Important:** 
- ✅ This file is in `.gitignore` (won't be committed)
- ✅ Never commit credentials to git
- ✅ Use `.env.local.example` as a template

---

### Step 6: Push Migrations (Optional)

After linking, push all migrations:

```powershell
cd packages/database/supabase
npx supabase db push
```

This will apply all 10 migrations to your remote database.

---

## Automated Setup Script

Run the automated script:

```powershell
cd packages/database/supabase
.\SETUP_ENV_AND_CONNECT.ps1
```

This script will:
1. Guide you through login
2. Link to your project
3. Prompt for credentials
4. Save to `.env.local` automatically

---

## Quick Commands Reference

```powershell
# Login
npx supabase login

# Link to remote
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push

# Verify connection
npx supabase db remote list

# Check migration status
npx supabase migration list
```

---

## Verify Setup

After saving `.env.local`, verify:

1. **Check file exists:**
   ```powershell
   Test-Path apps/web/.env.local
   ```

2. **Start dev server:**
   ```powershell
   pnpm dev
   ```

3. **Check for errors:**
   - No "Missing Supabase environment variables" errors
   - Application connects to Supabase successfully

---

## Troubleshooting

### "Missing Supabase environment variables"
- Verify `.env.local` exists in `apps/web/`
- Check variable names are correct (case-sensitive)
- Restart dev server after creating/updating `.env.local`

### "Project not found" when linking
- Verify project reference ID is correct
- Ensure you're logged in: `npx supabase login`
- Check you have access to the project

### "Authentication failed"
- Re-login: `npx supabase logout` then `npx supabase login`
- Verify access token is valid (if using token)

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Service role key (server-side only, keep secret!) |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Application URL (defaults to localhost:3000) |

---

## Security Notes

⚠️ **Important:**
- ✅ `.env.local` is in `.gitignore` - won't be committed
- ✅ Never commit credentials to git
- ✅ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep it secret!
- ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side (safe to expose)
- ✅ Rotate keys if compromised

---

*Ready to connect! Follow the steps above or run `.\SETUP_ENV_AND_CONNECT.ps1`*