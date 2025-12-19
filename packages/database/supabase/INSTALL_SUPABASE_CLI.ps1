# Supabase CLI Installation Script for Windows
# This script helps install Supabase CLI using available package managers

Write-Host "=== Supabase CLI Installation Script ===" -ForegroundColor Cyan
Write-Host ""

# Check for Scoop
Write-Host "Checking for Scoop..." -ForegroundColor Yellow
$scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue

if ($scoopInstalled) {
    Write-Host "✓ Scoop found! Installing Supabase CLI via Scoop..." -ForegroundColor Green
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    Write-Host "✓ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify installation:" -ForegroundColor Cyan
    Write-Host "  supabase --version" -ForegroundColor White
    exit 0
}

# Check for Chocolatey
Write-Host "Checking for Chocolatey..." -ForegroundColor Yellow
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "✓ Chocolatey found! Installing Supabase CLI via Chocolatey..." -ForegroundColor Green
    choco install supabase -y
    Write-Host "✓ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify installation:" -ForegroundColor Cyan
    Write-Host "  supabase --version" -ForegroundColor White
    exit 0
}

# No package manager found - provide instructions
Write-Host "✗ No package manager found (Scoop or Chocolatey)" -ForegroundColor Red
Write-Host ""
Write-Host "Installation Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Install Scoop (Recommended)" -ForegroundColor Yellow
Write-Host "  Run in PowerShell (as Administrator):" -ForegroundColor White
Write-Host "  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
Write-Host "  irm get.scoop.sh | iex" -ForegroundColor Gray
Write-Host "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor Gray
Write-Host "  scoop install supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use npx (No Installation)" -ForegroundColor Yellow
Write-Host "  You can use Supabase CLI without installing:" -ForegroundColor White
Write-Host "  npx supabase --version" -ForegroundColor Gray
Write-Host "  npx supabase login" -ForegroundColor Gray
Write-Host "  npx supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Manual Download" -ForegroundColor Yellow
Write-Host "  1. Visit: https://github.com/supabase/cli/releases" -ForegroundColor White
Write-Host "  2. Download latest supabase_windows_amd64.zip" -ForegroundColor White
Write-Host "  3. Extract supabase.exe" -ForegroundColor White
Write-Host "  4. Add to PATH or use full path" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: SUPABASE_CLI_SETUP.md" -ForegroundColor Cyan