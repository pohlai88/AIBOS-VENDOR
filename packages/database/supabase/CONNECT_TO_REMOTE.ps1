# Supabase Remote Connection Script
# This script helps connect to your remote Supabase project

Write-Host "=== Supabase Remote Connection Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is available
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = npx supabase --version 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Supabase CLI available (via npx)" -ForegroundColor Green
    Write-Host "  Version: $supabaseVersion" -ForegroundColor Gray
} else {
    Write-Host "✗ Supabase CLI not found" -ForegroundColor Red
    Write-Host "  Run: npm install -g supabase (or use npx)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login to Supabase" -ForegroundColor Cyan
Write-Host "  Run: npx supabase login" -ForegroundColor White
Write-Host "  This will open your browser to authenticate" -ForegroundColor Gray
Write-Host ""
$login = Read-Host "Have you logged in? (y/n)"

if ($login -ne "y") {
    Write-Host "  Please run: npx supabase login" -ForegroundColor Yellow
    Write-Host "  Then run this script again" -ForegroundColor Yellow
    exit 0
}

# Step 2: Get Project Reference
Write-Host ""
Write-Host "Step 2: Get Your Project Reference ID" -ForegroundColor Cyan
Write-Host "  1. Go to https://app.supabase.com" -ForegroundColor White
Write-Host "  2. Select your project" -ForegroundColor White
Write-Host "  3. Go to Settings > General" -ForegroundColor White
Write-Host "  4. Copy the Reference ID" -ForegroundColor White
Write-Host ""
$projectRef = Read-Host "Enter your Project Reference ID"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "✗ Project Reference ID is required" -ForegroundColor Red
    exit 1
}

# Step 3: Link Project
Write-Host ""
Write-Host "Step 3: Linking to Remote Project..." -ForegroundColor Cyan
Write-Host "  Project Reference: $projectRef" -ForegroundColor Gray
Write-Host ""

# Change to supabase directory
$supabaseDir = Join-Path $PSScriptRoot "."
Set-Location $supabaseDir

# Link the project
Write-Host "Running: npx supabase link --project-ref $projectRef" -ForegroundColor Yellow
npx supabase link --project-ref $projectRef

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully linked to remote project!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Push migrations: npx supabase db push" -ForegroundColor White
    Write-Host "  2. Verify connection: npx supabase db remote list" -ForegroundColor White
    Write-Host "  3. Check migration status: npx supabase migration list" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Failed to link project" -ForegroundColor Red
    Write-Host "  Check the error message above" -ForegroundColor Yellow
    Write-Host "  Common issues:" -ForegroundColor Yellow
    Write-Host "    - Not logged in (run: npx supabase login)" -ForegroundColor Gray
    Write-Host "    - Invalid project reference" -ForegroundColor Gray
    Write-Host "    - Network connectivity issues" -ForegroundColor Gray
    exit 1
}