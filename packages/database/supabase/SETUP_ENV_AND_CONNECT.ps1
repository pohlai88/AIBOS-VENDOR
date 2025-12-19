# Supabase Connection and Environment Setup Script
# This script helps connect to Supabase and save environment variables

Write-Host "=== Supabase Connection and Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to Supabase
Write-Host "Step 1: Login to Supabase" -ForegroundColor Yellow
Write-Host "  This will open your browser to authenticate" -ForegroundColor Gray
Write-Host ""
$proceed = Read-Host "Ready to login? (y/n)"

if ($proceed -eq "y") {
    Write-Host "  Running: npx supabase login" -ForegroundColor Gray
    npx supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
}
else {
    Write-Host "  Skipping login. Make sure you're logged in before proceeding." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Get Project Reference
Write-Host "Step 2: Get Your Project Reference ID" -ForegroundColor Yellow
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
Write-Host "Step 3: Linking to Remote Project..." -ForegroundColor Yellow
$supabaseDir = Join-Path $PSScriptRoot "."
Set-Location $supabaseDir

Write-Host "  Running: npx supabase link --project-ref $projectRef" -ForegroundColor Gray
npx supabase link --project-ref $projectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to link project" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Get Project Info
Write-Host "Step 4: Getting Project Information..." -ForegroundColor Yellow
Write-Host "  Fetching project details from Supabase Dashboard..." -ForegroundColor Gray
Write-Host ""
Write-Host "  Please get the following from your Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "    1. Go to Settings > API" -ForegroundColor White
Write-Host "    2. Copy 'Project URL'" -ForegroundColor White
Write-Host "    3. Copy 'anon public' key" -ForegroundColor White
Write-Host "    4. Copy 'service_role' key (optional, for admin operations)" -ForegroundColor White
Write-Host ""

# Get credentials from user
$supabaseUrl = Read-Host "Enter Supabase Project URL"
$supabaseAnonKey = Read-Host "Enter Supabase Anon Key"
$supabaseServiceKey = Read-Host "Enter Supabase Service Role Key (optional, press Enter to skip)"

# Step 5: Save to .env.local
Write-Host ""
Write-Host "Step 5: Saving Environment Variables..." -ForegroundColor Yellow

$envFile = Join-Path (Split-Path (Split-Path $PSScriptRoot)) "apps\web\.env.local"
$envDir = Split-Path $envFile

# Create directory if it doesn't exist
if (-not (Test-Path $envDir)) {
    New-Item -ItemType Directory -Path $envDir -Force | Out-Null
}

# Create or update .env.local
$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
"@

if (-not [string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
    $envContent += "`nSUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey"
}

# Add app URL if not exists
$envContent += "`n`n# Application Configuration"
$envContent += "`nNEXT_PUBLIC_APP_URL=http://localhost:3000"

# Check if file exists and preserve other variables
if (Test-Path $envFile) {
    Write-Host "  .env.local exists, updating Supabase variables..." -ForegroundColor Gray
    $existingContent = Get-Content $envFile -Raw
    
    # Remove old Supabase variables if they exist
    $existingContent = $existingContent -replace "NEXT_PUBLIC_SUPABASE_URL=.*", ""
    $existingContent = $existingContent -replace "NEXT_PUBLIC_SUPABASE_ANON_KEY=.*", ""
    $existingContent = $existingContent -replace "SUPABASE_SERVICE_ROLE_KEY=.*", ""
    $existingContent = $existingContent -replace "NEXT_PUBLIC_APP_URL=.*", ""
    
    # Clean up multiple newlines
    $existingContent = $existingContent -replace "(`r?`n){3,}", "`r`n`r`n"
    
    # Append new content
    $envContent = $existingContent.Trim() + "`r`n`r`n" + $envContent
}
else {
    Write-Host "  Creating new .env.local file..." -ForegroundColor Gray
}

# Write to file
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host "✓ Environment variables saved to: $envFile" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "Step 6: Verification" -ForegroundColor Yellow
Write-Host "  Environment file location: $envFile" -ForegroundColor Gray
Write-Host "  File exists: $(Test-Path $envFile)" -ForegroundColor Gray
Write-Host ""

# Step 7: Push Migrations (Optional)
Write-Host "Step 7: Push Migrations (Optional)" -ForegroundColor Yellow
$pushMigrations = Read-Host "Do you want to push migrations now? (y/n)"

if ($pushMigrations -eq "y") {
    Write-Host "  Running: npx supabase db push" -ForegroundColor Gray
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migrations pushed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Migration push failed. Check errors above." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Verify .env.local file: $envFile" -ForegroundColor White
Write-Host "  2. Start development server: pnpm dev" -ForegroundColor White
Write-Host "  3. Test connection in your application" -ForegroundColor White
Write-Host ""
Write-Host "Environment variables saved:" -ForegroundColor Cyan
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Green
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Green
if (-not [string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
    Write-Host "  ✓ SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Green
}
Write-Host "  ✓ NEXT_PUBLIC_APP_URL" -ForegroundColor Green