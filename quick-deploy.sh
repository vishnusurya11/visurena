#!/bin/bash

# Quick deployment script for ViSuReNa website (macOS / Linux).
# Mirrors quick-deploy.ps1: builds the pnpm + turbo monorepo and deploys
# apps/web/out to S3, then invalidates CloudFront if configured.
#
# Requires: pnpm and the AWS CLI on PATH, AWS credentials configured.

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}ViSuReNa Quick Deploy${NC}"
echo "====================="

# Always operate from the repo root (this script's directory)
cd "$(dirname "$0")"

# Check if S3 bucket is set
if [ -z "$S3_BUCKET" ]; then
    S3_BUCKET="visurena.com"
    echo -e "${YELLOW}Using default S3 bucket: $S3_BUCKET${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies (pnpm install)...${NC}"
    pnpm install
fi

# Build the monorepo (turbo builds packages first, then apps/web -> apps/web/out)
echo -e "${YELLOW}Building production version (pnpm build)...${NC}"
pnpm build

OUT="apps/web/out"
if [ ! -d "$OUT" ]; then
    echo -e "${RED}Build output not found at $OUT${NC}"
    exit 1
fi

# Deploy to S3
echo -e "${YELLOW}Deploying to S3...${NC}"
aws s3 sync "$OUT/" "s3://$S3_BUCKET" --delete

# Invalidate CloudFront cache if distribution ID is set
if [ ! -z "$CLOUDFRONT_DIST_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DIST_ID" --paths "/*"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Visit: https://$S3_BUCKET${NC}"
