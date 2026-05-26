#!/usr/bin/env pwsh
# Quick deployment script for ViSuReNa (Windows / PowerShell).
# Mirrors quick-deploy.sh: builds the pnpm + turbo monorepo and deploys
# apps/web/out to S3, then invalidates CloudFront if configured.
#
# Requires: pnpm and the AWS CLI on PATH, AWS credentials configured.
# Env overrides: $env:S3_BUCKET, $env:CLOUDFRONT_DIST_ID

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }

# Run a native command and fail the script if it returns a non-zero exit code.
function Exec($file, [string[]]$cmdArgs) {
    & $file @cmdArgs
    if ($LASTEXITCODE -ne 0) { throw "$file exited with code $LASTEXITCODE" }
}

Write-Ok "ViSuReNa Quick Deploy"
Write-Host "====================="

# Always operate from the repo root (this script's directory)
$repoRoot = $PSScriptRoot
Set-Location $repoRoot

# S3 bucket: env override, else default
$bucket = $env:S3_BUCKET
if ([string]::IsNullOrWhiteSpace($bucket)) {
    $bucket = "visurena.com"
    Write-Step "Using default S3 bucket: $bucket"
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Step "Installing dependencies (pnpm install)..."
    Exec "pnpm" @("install")
}

# Build the monorepo (turbo builds packages first, then apps/web -> apps/web/out)
Write-Step "Building production version (pnpm build)..."
Exec "pnpm" @("build")

$out = Join-Path $repoRoot "apps\web\out"
if (-not (Test-Path $out)) {
    throw "Build output not found at $out"
}

# Deploy to S3
Write-Step "Deploying to S3..."
Exec "aws" @("s3", "sync", $out, "s3://$bucket", "--delete")

# Invalidate CloudFront cache if a distribution id is set
if (-not [string]::IsNullOrWhiteSpace($env:CLOUDFRONT_DIST_ID)) {
    Write-Step "Invalidating CloudFront cache..."
    Exec "aws" @("cloudfront", "create-invalidation", "--distribution-id", $env:CLOUDFRONT_DIST_ID, "--paths", "/*")
}

Write-Ok "Deployment complete!"
Write-Ok "Visit: https://$bucket"
