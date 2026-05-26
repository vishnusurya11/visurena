#!/bin/bash

# Deployment preview script for ViSuReNa (macOS / Linux).
# Mirrors deploy-preview.ps1: builds the monorepo, serves the static export
# locally for review, then optionally deploys to S3 + CloudFront.
#
# Requires: pnpm and the AWS CLI on PATH, AWS credentials configured.

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}ViSuReNa Deployment Preview Script${NC}"
echo "===================================="

# Always operate from the repo root (this script's directory)
cd "$(dirname "$0")"

# Check we're in the right place
if [ ! -d "apps/web" ]; then
    echo -e "${RED}Error: apps/web directory not found!${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "\n${YELLOW}Step 1: Installing dependencies (pnpm install)...${NC}"
pnpm install

# Step 2: Build the monorepo (turbo builds packages first, then apps/web)
echo -e "\n${YELLOW}Step 2: Building production version (pnpm build)...${NC}"
if ! pnpm build; then
    echo -e "${RED}Build failed! Please fix errors before continuing.${NC}"
    exit 1
fi

OUT="apps/web/out"
if [ ! -d "$OUT" ]; then
    echo -e "${RED}Build output not found at $OUT${NC}"
    exit 1
fi

# Step 3: Start preview server
echo -e "\n${GREEN}Build successful! Starting preview server...${NC}"
echo -e "${YELLOW}Preview URL: http://localhost:8080${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the preview server${NC}\n"

# Serve the static files
npx serve "$OUT" -p 8080

# After preview is stopped
echo -e "\n${YELLOW}Preview stopped. Would you like to deploy to production? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Deploying to production...${NC}"

    # Get S3 bucket name from env or prompt
    if [ -z "$S3_BUCKET" ]; then
        echo "Enter your S3 bucket name:"
        read -r S3_BUCKET
    fi

    # Sync to S3
    echo -e "${YELLOW}Syncing to S3...${NC}"
    aws s3 sync "$OUT/" "s3://$S3_BUCKET" --delete

    # Invalidate CloudFront cache
    if [ ! -z "$CLOUDFRONT_DIST_ID" ]; then
        echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
        aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DIST_ID" --paths "/*"
    fi

    echo -e "\n${GREEN}Deployment complete!${NC}"
else
    echo -e "\n${YELLOW}Deployment cancelled. Files are still available in apps/web/out.${NC}"
fi
