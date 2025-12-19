# Connect to Supabase using existing credentials
# Project Reference: vrawceruzokxitybkufk

param(
    [string]$AnonKey = "",
    [string]$ServiceKey = ""
)

Write-Host "=== Supabase Connection with Existing Credentials ===" -ForegroundColor Cyan
Write-Host ""

# Project details from .env
$projectRef = "vrawceruzokxitybkufk"
$projectUrl = "https://vrawceruzokxitybkufk.supabase.co"
$dbPassword = "Weepohlai88!"

Write-Host "Project Details:" -ForegroundColor Yellow
Write-Host "  Project Reference: $projectRef" -ForegroundColor Gray
Write-Host "  Project URL: $projectUrl" -ForegroundColor Gray
Write-Host ""

# Step 1: Login first (if not already logged in)
Write-Host "Step 1: Checking Supabase CLI authentication..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Not logged in. Please login first:" -ForegroundColor Yellow
    Write-Host "  Run: npx supabase login" -ForegroundColor White
    Write-Host "  Or use token: npx supabase login --token YOUR_TOKEN" -ForegroundColor White
    Write-Host ""
    $shouldLogin = Read-Host "Do you want to login now? (y/n)"
    
    if ($shouldLogin -eq "y") {
        npx supabase login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Login failed" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "  Continuing without login. Linking may fail if not authenticated." -ForegroundColor Yellow
    }
}

# Step 2: Link to project
Write-Host ""
Write-Host "Step 2: Linking to Supabase project..." -ForegroundColor Yellow
$supabaseDir = Join-Path $PSScriptRoot "."
Set-Location $supabaseDir

Write-Host "  Running: npx supabase link --project-ref $projectRef" -ForegroundColor Gray
npx supabase link --project-ref $projectRef --password $dbPassword

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Link failed, but continuing with environment setup..." -ForegroundColor Yellow
    Write-Host "  You may need to login first: npx supabase login" -ForegroundColor Gray
}
else {
    Write-Host "✓ Project linked successfully!" -ForegroundColor Green
}

Write-Host ""

# Step 3: Get API keys
Write-Host "Step 3: Get API Keys from Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  Go to: https://app.supabase.com/project/$projectRef/settings/api" -ForegroundColor Cyan
Write-Host "  Copy the following keys:" -ForegroundColor White
Write-Host "    1. 'anon public' key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)" -ForegroundColor Gray
Write-Host "    2. 'service_role' key (for SUPABASE_SERVICE_ROLE_KEY)" -ForegroundColor Gray
Write-Host ""

if ([string]::IsNullOrWhiteSpace($AnonKey)) {
    $AnonKey = Read-Host "Enter Anon Key (anon public)"
}

if ([string]::IsNullOrWhiteSpace($ServiceKey)) {
    $ServiceKey = Read-Host "Enter Service Role Key (service_role, optional - press Enter to skip)"
}

if ([string]::IsNullOrWhiteSpace($AnonKey)) {
    Write-Host "✗ Anon Key is required" -ForegroundColor Red
    exit 1
}

# Step 4: Save to .env.local
Write-Host ""
Write-Host "Step 4: Saving Environment Variables..." -ForegroundColor Yellow

$envFile = Join-Path (Split-Path (Split-Path $PSScriptRoot)) "apps\web\.env.local"
$envDir = Split-Path $envFile

if (-not (Test-Path $envDir)) {
    New-Item -ItemType Directory -Path $envDir -Force | Out-Null
}

$envContent = @"
# Supabase Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Project: $projectRef

NEXT_PUBLIC_SUPABASE_URL=$projectUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$AnonKey
"@

if (-not [string]::IsNullOrWhiteSpace($ServiceKey)) {
    $envContent += "`nSUPABASE_SERVICE_ROLE_KEY=$ServiceKey"
}

$envContent += "`n`n# Application Configuration"
$envContent += "`nNEXT_PUBLIC_APP_URL=http://localhost:3000"

# Preserve existing content if file exists
if (Test-Path $envFile) {
    Write-Host "  .env.local exists, updating Supabase variables..." -ForegroundColor Gray
    $existing = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
    
    if ($existing) {
        # Remove old Supabase vars
        $existing = $existing -replace "(?m)^NEXT_PUBLIC_SUPABASE_URL=.*$", ""
        $existing = $existing -replace "(?m)^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$", ""
        $existing = $existing -replace "(?m)^SUPABASE_SERVICE_ROLE_KEY=.*$", ""
        $existing = $existing -replace "(?m)^NEXT_PUBLIC_APP_URL=.*$", ""
        $existing = $existing.Trim()
        
        if ($existing -and $existing.Length -gt 0) {
            $envContent = $existing + "`r`n`r`n" + $envContent
        }
    }
}
else {
    Write-Host "  Creating new .env.local file..." -ForegroundColor Gray
}

# Write to file
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host "✓ Environment variables saved to:" -ForegroundColor Green
Write-Host "  $envFile" -ForegroundColor Gray
Write-Host ""

# Step 5: Verify
Write-Host "Step 5: Verification" -ForegroundColor Yellow
Write-Host "  File exists: $(Test-Path $envFile)" -ForegroundColor Gray
Write-Host "  File location: $envFile" -ForegroundColor Gray
Write-Host ""

# Step 6: Push Migrations (Optional)
Write-Host "Step 6: Push Migrations (Optional)" -ForegroundColor Yellow
$pushMigrations = Read-Host "Do you want to push migrations now? (y/n)"

if ($pushMigrations -eq "y") {
    Write-Host "  Running: npx supabase db push" -ForegroundColor Gray
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migrations pushed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Migration push failed. You may need to login first." -ForegroundColor Red
        Write-Host "  Run: npx supabase login" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Environment variables saved:" -ForegroundColor Cyan
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_URL=$projectUrl" -ForegroundColor Green
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=$AnonKey" -ForegroundColor Green
if (-not [string]::IsNullOrWhiteSpace($ServiceKey)) {
    Write-Host "  ✓ SUPABASE_SERVICE_ROLE_KEY=$ServiceKey" -ForegroundColor Green
}
Write-Host "  ✓ NEXT_PUBLIC_APP_URL=http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start dev server: pnpm dev" -ForegroundColor White
Write-Host "  2. Test connection in your application" -ForegroundColor White
Write-Host "  3. Push migrations: npx supabase db push" -ForegroundColor White