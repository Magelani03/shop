# Deploy shop: API (Worker + D1) and Frontend (Pages)
# Run from project root: .\scripts\deploy.ps1
# Optional: pass Worker URL for frontend, e.g. .\scripts\deploy.ps1 -WorkerUrl "https://shop-api.<your-subdomain>.workers.dev"

param(
    [string]$WorkerUrl = "",
    [switch]$ApiOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

function Deploy-Api {
    Write-Host "`n=== Deploying API (Worker) ===" -ForegroundColor Cyan
    npm run worker:deploy
    if ($LASTEXITCODE -ne 0) { throw "Worker deploy failed." }
    Write-Host "API deployed. Note the Worker URL (e.g. https://shop-api.<subdomain>.workers.dev)" -ForegroundColor Green
}

function Deploy-Frontend {
    param([string]$ApiOrigin)
    if (-not $ApiOrigin) {
        Write-Host "Frontend deploy needs the Worker URL. Set VITE_API_ORIGIN or pass -WorkerUrl." -ForegroundColor Yellow
        $ApiOrigin = $env:VITE_API_ORIGIN
    }
    if (-not $ApiOrigin) {
        Write-Host "Example: .\scripts\deploy.ps1 -WorkerUrl 'https://shop-api.YOUR-SUBDOMAIN.workers.dev'" -ForegroundColor Yellow
        throw "Set WorkerUrl or env VITE_API_ORIGIN to your Worker URL."
    }
    Write-Host "`n=== Building frontend with API origin: $ApiOrigin ===" -ForegroundColor Cyan
    $env:VITE_API_ORIGIN = $ApiOrigin
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed." }
    Write-Host "`n=== Deploying frontend to Cloudflare Pages ===" -ForegroundColor Cyan
    npx wrangler pages deploy ./dist --project-name=shop
    if ($LASTEXITCODE -ne 0) { throw "Pages deploy failed." }
    Write-Host "Frontend deployed." -ForegroundColor Green
}

# Main
if (-not $ApiOnly -and -not $FrontendOnly) {
    Deploy-Api
    if (-not $WorkerUrl) {
        $WorkerUrl = Read-Host "Paste the Worker URL from above (e.g. https://shop-api.xxx.workers.dev)"
    }
    Deploy-Frontend -ApiOrigin $WorkerUrl
} elseif ($ApiOnly) {
    Deploy-Api
} elseif ($FrontendOnly) {
    $origin = if ($WorkerUrl) { $WorkerUrl } else { $env:VITE_API_ORIGIN }
    Deploy-Frontend -ApiOrigin $origin
}

Write-Host "`nDone." -ForegroundColor Green
