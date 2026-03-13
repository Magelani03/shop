# Deploy frontend to Cloudflare Pages (API is on Vercel)
# Run from project root: .\scripts\deploy.ps1
# Set VITE_API_ORIGIN to your Vercel URL, or pass: .\scripts\deploy.ps1 -ApiOrigin "https://your-app.vercel.app"

param(
    [string]$ApiOrigin = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

$origin = if ($ApiOrigin) { $ApiOrigin } else { $env:VITE_API_ORIGIN }
if (-not $origin) {
    Write-Host "Set VITE_API_ORIGIN or pass -ApiOrigin (your Vercel URL, e.g. https://shop-xxx.vercel.app)" -ForegroundColor Yellow
    throw "Missing API origin."
}

Write-Host "`n=== Building frontend (API: $origin) ===" -ForegroundColor Cyan
$env:VITE_API_ORIGIN = $origin
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed." }

Write-Host "`n=== Deploying to Cloudflare Pages ===" -ForegroundColor Cyan
npx wrangler pages deploy ./dist --project-name=shop
if ($LASTEXITCODE -ne 0) { throw "Pages deploy failed." }

Write-Host "`nDone." -ForegroundColor Green
