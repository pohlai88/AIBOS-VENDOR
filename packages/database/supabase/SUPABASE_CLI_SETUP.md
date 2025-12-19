# Supabase CLI Setup Guide

**Date:** 2025-01-27  
**Purpose:** Guide for installing and using Supabase CLI for local development

---

## Installation

### ⚠️ Important Note

**Supabase CLI no longer supports global npm installation.**  
Use one of the supported package managers below.

---

### Option 1: Scoop (Windows - Recommended)

**Prerequisites:**
- PowerShell (run as Administrator)
- Git installed

**Installation Steps:**

1. **Install Scoop** (if not already installed):
   ```powershell
   # Set execution policy (run as Administrator)
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   # Install Scoop
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
   ```

2. **Add Supabase Bucket:**
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   ```

3. **Install Supabase CLI:**
   ```powershell
   scoop install supabase
   ```

---

### Option 2: Homebrew (macOS/Linux)

```bash
brew install supabase/tap/supabase
```

---

### Option 3: Direct Download (Windows/macOS/Linux)

1. **Download Binary:**
   - Visit: https://github.com/supabase/cli/releases
   - Download the appropriate binary for your OS
   - Extract and add to PATH

2. **Windows (PowerShell):**
   ```powershell
   # Download latest release
   $url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip"
   Invoke-WebRequest -Uri $url -OutFile "supabase.zip"
   
   # Extract
   Expand-Archive -Path "supabase.zip" -DestinationPath "."
   
   # Add to PATH (or move to a directory in PATH)
   # Move supabase.exe to C:\Windows\System32 or add directory to PATH
   ```

---

### Option 4: Using npx (Temporary/One-time Use)

For one-time commands without installation:

```bash
npx supabase@latest <command>
```

**Note:** This is slower but doesn't require installation.

---

## Verify Installation

```bash
supabase --version
```

Expected output: `supabase version X.X.X`

---

## Initialize Local Project

### Step 1: Navigate to Database Directory

```bash
cd packages/database/supabase
```

### Step 2: Initialize Supabase

```bash
supabase init
```

This creates:
- `config.toml` - Supabase configuration
- `migrations/` - Migration files directory
- `.gitignore` - Git ignore rules

---

## Link to Remote Project

### Step 1: Get Project Reference

From Supabase Dashboard:
- Project Settings > General
- Copy "Reference ID" (e.g., `vrawceruzokxitybkufk`)

### Step 2: Link Project

```bash
supabase link --project-ref vrawceruzokxitybkufk
```

You'll be prompted for:
- Database password (from Supabase Dashboard)
- Or use access token

---

## Common CLI Commands

### Database Management

```bash
# Pull remote schema
supabase db pull

# Push local migrations
supabase db push

# Reset database
supabase db reset

# Create new migration
supabase migration new migration_name
```

### Local Development

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Status check
supabase status
```

### Migration Management

```bash
# List migrations
supabase migration list

# Apply migrations
supabase migration up

# Rollback migration
supabase migration down
```

### Functions

```bash
# Deploy Edge Function
supabase functions deploy function_name

# List functions
supabase functions list
```

---

## Configuration File

### config.toml Structure

```toml
project_id = "vrawceruzokxitybkufk"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323
```

---

## Integration with MCP Tools

### Using CLI + MCP Together

1. **CLI for Local Development:**
   - Local database setup
   - Migration management
   - Local testing

2. **MCP for Production:**
   - Production validation
   - Real-time monitoring
   - Security audits

### Workflow

```bash
# 1. Create migration locally
supabase migration new add_feature

# 2. Write migration SQL
# Edit: supabase/migrations/XXXX_add_feature.sql

# 3. Test locally
supabase db reset

# 4. Apply to production (via MCP or Dashboard)
# Or use: supabase db push
```

---

## Troubleshooting

### Error: "Installing Supabase CLI as a global module is not supported"

**Problem:** You tried to install via `npm install -g supabase`

**Solution:** Use one of the supported methods:
- **Windows:** Use Scoop (Option 1 above)
- **macOS:** Use Homebrew (Option 2 above)
- **All Platforms:** Direct download (Option 3 above)

### CLI Not Found

**Windows PowerShell:**
```powershell
# Check if in PATH
$env:PATH -split ';' | Select-String supabase

# If using Scoop, verify installation
scoop list supabase

# If using direct download, add to PATH
$env:PATH += ";C:\path\to\supabase"
```

### Scoop Installation Issues

**If Scoop installation fails:**
```powershell
# Check execution policy
Get-ExecutionPolicy

# Set execution policy (run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Try installing Scoop again
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Connection Issues

```bash
# Check project link
supabase projects list

# Re-link if needed
supabase link --project-ref YOUR_PROJECT_REF
```

### Migration Conflicts

```bash
# Check migration status
supabase migration list

# Resolve conflicts manually
# Edit migration files as needed
```

---

## Best Practices

1. **Always Test Locally:**
   ```bash
   supabase start
   supabase db reset
   # Test your changes
   ```

2. **Version Control:**
   - Commit `config.toml`
   - Commit all migrations
   - Don't commit `.env` files

3. **Migration Naming:**
   ```bash
   # Good names
   supabase migration new add_users_table
   supabase migration new fix_rls_policies
   
   # Bad names
   supabase migration new migration1
   supabase migration new fix
   ```

4. **Regular Sync:**
   ```bash
   # Pull latest schema
   supabase db pull
   
   # Review changes
   # Create migration if needed
   ```

---

## References

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Migration Guide](https://supabase.com/docs/guides/cli/managing-environments)

---

**Last Updated:** 2025-01-27  
**Status:** 📝 **GUIDE READY**
