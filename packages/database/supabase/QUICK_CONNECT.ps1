# Quick Supabase Connection and Environment Setup
# Simplified version for quick setup

param(
    [string]$ProjectRef = "",
    [string]$SupabaseUrl = "",
    [string]$AnonKey = "",
    [string]$ServiceKey = ""
)

Write-Host "=== Quick Supabase Connection Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get project reference if not provided
if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
    Write-Host "Enter your Supabase Project Reference ID:" -ForegroundColor Yellow
    Write-Host "  (Find it at: https://app.supabase.com -> Settings -> General)" -ForegroundColor Gray
    $ProjectRef = Read-Host "Project Reference"
}

if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
    Write-Host "✗ Project Reference is required" -ForegroundColor Red
    exit 1
}

# Link to project
Write-Host ""
Write-Host "Linking to Supabase project..." -ForegroundColor Yellow
$supabaseDir = Join-Path $PSScriptRoot "."
Set-Location $supabaseDir

npx supabase link --project-ref $ProjectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to link. Make sure you're logged in: npx supabase login" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project linked!" -ForegroundColor Green
Write-Host ""

# Get credentials if not provided
if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) {
    Write-Host "Enter Supabase credentials from:" -ForegroundColor Yellow
    Write-Host "  https://app.supabase.com -> Settings -> API" -ForegroundColor Gray
    Write-Host ""
    $SupabaseUrl = Read-Host "Supabase Project URL"
    $AnonKey = Read-Host "Anon Key (public)"
    $ServiceKey = Read-Host "Service Role Key (optional, press Enter to skip)"
}

# Save to .env.local
$envFile = Join-Path (Split-Path (Split-Path $PSScriptRoot)) "apps\web\.env.local"
$envDir = Split-Path $envFile

if (-not (Test-Path $envDir)) {
    New-Item -ItemType Directory -Path $envDir -Force | Out-Null
}

$envContent = @"
# Supabase Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$AnonKey
"@

if (-not [string]::IsNullOrWhiteSpace($ServiceKey)) {
    $envContent += "`nSUPABASE_SERVICE_ROLE_KEY=$ServiceKey"
}

$envContent += "`n`n# Application Configuration"
$envContent += "`nNEXT_PUBLIC_APP_URL=http://localhost:3000"

# Preserve existing content if file exists
if (Test-Path $envFile) {
    $existing = Get-Content $envFile -Raw
    # Remove old Supabase vars
    $existing = $existing -replace "(?m)^NEXT_PUBLIC_SUPABASE_URL=.*$", ""
    $existing = $existing -replace "(?m)^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$", ""
    $existing = $existing -replace "(?m)^SUPABASE_SERVICE_ROLE_KEY=.*$", ""
    $existing = $existing -replace "(?m)^NEXT_PUBLIC_APP_URL=.*$", ""
    $existing = $existing.Trim()
    
    if ($existing) {
        $envContent = $existing + "`r`n`r`n" + $envContent
    }
}

$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✓ Environment variables saved to:" -ForegroundColor Green
Write-Host "  $envFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Push migrations: npx supabase db push" -ForegroundColor White
Write-Host "  2. Start dev server: pnpm dev" -ForegroundColor White