# Save Environment Variables from Supabase Project
# Project: vrawceruzokxitybkufk

Write-Host "=== Save Supabase Environment Variables ===" -ForegroundColor Cyan
Write-Host ""

# Project details
$projectRef = "vrawceruzokxitybkufk"
$projectUrl = "https://vrawceruzokxitybkufk.supabase.co"

Write-Host "Project Information:" -ForegroundColor Yellow
Write-Host "  Project Reference: $projectRef" -ForegroundColor Gray
Write-Host "  Project URL: $projectUrl" -ForegroundColor Gray
Write-Host ""

# Get API keys from user
Write-Host "Get API Keys from Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  URL: https://app.supabase.com/project/$projectRef/settings/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "  You need:" -ForegroundColor White
Write-Host "    1. 'anon public' key (starts with eyJ...)" -ForegroundColor Gray
Write-Host "    2. 'service_role' key (starts with eyJ..., optional)" -ForegroundColor Gray
Write-Host ""

$anonKey = Read-Host "Enter Anon Key (anon public)"
$serviceKey = Read-Host "Enter Service Role Key (service_role, optional - press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($anonKey)) {
    Write-Host "✗ Anon Key is required" -ForegroundColor Red
    exit 1
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
# Project Reference: $projectRef

NEXT_PUBLIC_SUPABASE_URL=$projectUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@

if (-not [string]::IsNullOrWhiteSpace($serviceKey)) {
    $envContent += "`nSUPABASE_SERVICE_ROLE_KEY=$serviceKey"
}

$envContent += "`n`n# Application Configuration"
$envContent += "`nNEXT_PUBLIC_APP_URL=http://localhost:3000"

# Preserve existing content if file exists
if (Test-Path $envFile) {
    Write-Host "  Updating existing .env.local file..." -ForegroundColor Gray
    $existing = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
    
    if ($existing) {
        # Remove old Supabase vars (case-insensitive)
        $lines = $existing -split "`r?`n"
        $filteredLines = $lines | Where-Object {
            $_ -notmatch "^NEXT_PUBLIC_SUPABASE_URL=" -and
            $_ -notmatch "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" -and
            $_ -notmatch "^SUPABASE_SERVICE_ROLE_KEY=" -and
            $_ -notmatch "^NEXT_PUBLIC_APP_URL=" -and
            $_ -notmatch "^# Supabase Configuration" -and
            $_ -notmatch "^# Generated:" -and
            $_ -notmatch "^# Project Reference:"
        }
        
        $existing = $filteredLines -join "`r`n"
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

Write-Host ""
Write-Host "✓ Environment variables saved successfully!" -ForegroundColor Green
Write-Host "  File: $envFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Saved variables:" -ForegroundColor Cyan
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_URL=$projectUrl" -ForegroundColor Green
Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey" -ForegroundColor Green
if (-not [string]::IsNullOrWhiteSpace($serviceKey)) {
    Write-Host "  ✓ SUPABASE_SERVICE_ROLE_KEY=$serviceKey" -ForegroundColor Green
}
Write-Host "  ✓ NEXT_PUBLIC_APP_URL=http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Login to Supabase CLI: npx supabase login" -ForegroundColor White
Write-Host "  2. Link project: npx supabase link --project-ref $projectRef" -ForegroundColor White
Write-Host "  3. Push migrations: npx supabase db push" -ForegroundColor White
Write-Host "  4. Start dev server: pnpm dev" -ForegroundColor White