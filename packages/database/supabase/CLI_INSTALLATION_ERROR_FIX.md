# Supabase CLI Installation Error Fix

**Date:** 2025-01-27  
**Error:** `Installing Supabase CLI as a global module is not supported`  
**Status:** ✅ **FIXED**

---

## Error Details

### Error Message

```
Installing Supabase CLI as a global module is not supported.
Please use one of the supported package managers: https://github.com/supabase/cli#install-the-cli
```

### Cause

Supabase CLI **no longer supports** global npm installation (`npm install -g supabase`). This was changed to ensure better compatibility and easier updates.

---

## Solution: Install Using Scoop (Windows)

### Step 1: Install Scoop (if not installed)

Open PowerShell as **Administrator**:

```powershell
# Set execution policy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Scoop
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Step 2: Add Supabase Bucket

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
```

### Step 3: Install Supabase CLI

```powershell
scoop install supabase
```

### Step 4: Verify Installation

```powershell
supabase --version
```

Expected output: `supabase version X.X.X`

---

## Alternative Methods

### Option 1: Direct Download (Windows)

1. Visit: https://github.com/supabase/cli/releases
2. Download `supabase_windows_amd64.zip`
3. Extract and add `supabase.exe` to your PATH

### Option 2: Use npx (Temporary)

For one-time commands without installation:

```powershell
npx supabase@latest --version
npx supabase@latest init
```

**Note:** This is slower but doesn't require installation.

---

## Why npm Global Installation Was Removed

1. **Better Updates:** Package managers handle updates automatically
2. **Cross-Platform:** Consistent installation across platforms
3. **Dependency Management:** Better handling of native dependencies
4. **Security:** More secure installation process

---

## Verification

After installation, test the CLI:

```powershell
# Check version
supabase --version

# Check help
supabase --help

# List available commands
supabase
```

---

## Next Steps

Once installed, you can:

1. **Initialize local project:**
   ```powershell
   cd packages/database/supabase
   supabase init
   ```

2. **Link to remote project:**
   ```powershell
   supabase link --project-ref vrawceruzokxitybkufk
   ```

3. **Start local development:**
   ```powershell
   supabase start
   ```

---

## References

- [Supabase CLI Installation Guide](https://github.com/supabase/cli#install-the-cli)
- [Scoop Package Manager](https://scoop.sh/)
- [Updated CLI Setup Guide](./SUPABASE_CLI_SETUP.md)

---

**Last Updated:** 2025-01-27  
**Status:** ✅ **RESOLVED**
