#!/usr/bin/env pwsh
# Deployment preview script for ViSuReNa (Windows / PowerShell).
# Mirrors deploy-preview.sh: builds the monorepo, serves the static export
# locally for review, then optionally deploys to S3 + CloudFront.
#
# Requires: pnpm and the AWS CLI on PATH, AWS credentials configured.
# Env overrides: $env:S3_BUCKET, $env:CLOUDFRONT_DIST_ID

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

function Exec($file, [string[]]$cmdArgs) {
    & $file @cmdArgs
    if ($LASTEXITCODE -ne 0) { throw "$file exited with code $LASTEXITCODE" }
}

Write-Ok "ViSuReNa Deployment Preview Script"
Write-Host "===================================="

# Always operate from the repo root (this script's directory)
$repoRoot = $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path "apps\web")) {
    Write-Err "Error: apps\web directory not found!"
    exit 1
}

# Step 1: Install dependencies
Write-Step "`nStep 1: Installing dependencies (pnpm install)..."
Exec "pnpm" @("install")

# Step 2: Build the monorepo (turbo builds packages first, then apps/web)
Write-Step "`nStep 2: Building production version (pnpm build)..."
Exec "pnpm" @("build")

$out = Join-Path $repoRoot "apps\web\out"
if (-not (Test-Path $out)) {
    Write-Err "Build output not found at $out"
    exit 1
}

# Step 3: Start preview server
Write-Ok "`nBuild successful! Starting preview server..."
Write-Step "Preview URL: http://localhost:8080"
Write-Step "Press Ctrl+C to stop the preview server`n"

# Serve the static files (Ctrl+C returns control to this script)
& npx serve $out -p 8080

# Step 4: After preview is stopped, offer to deploy
$response = Read-Host "`nPreview stopped. Would you like to deploy to production? (y/n)"

if ($response -match '^[Yy]$') {
    Write-Step "`nDeploying to production..."

    $bucket = $env:S3_BUCKET
    if ([string]::IsNullOrWhiteSpace($bucket)) {
        $bucket = Read-Host "Enter your S3 bucket name"
    }

    Write-Step "Syncing to S3..."
    Exec "aws" @("s3", "sync", $out, "s3://$bucket", "--delete")

    if (-not [string]::IsNullOrWhiteSpace($env:CLOUDFRONT_DIST_ID)) {
        Write-Step "Invalidating CloudFront cache..."
        Exec "aws" @("cloudfront", "create-invalidation", "--distribution-id", $env:CLOUDFRONT_DIST_ID, "--paths", "/*")
    }

    Write-Ok "`nDeployment complete!"
} else {
    Write-Step "`nDeployment cancelled. Files are still available in apps\web\out."
}
