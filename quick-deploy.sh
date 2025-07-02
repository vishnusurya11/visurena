#!/bin/bash

# Quick deployment script for ViSuReNa website
# This script builds and deploys directly without preview

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}ViSuReNa Quick Deploy${NC}"
echo "====================="

# Check if S3 bucket is set
if [ -z "$S3_BUCKET" ]; then
    S3_BUCKET="visurena.com"
    echo -e "${YELLOW}Using default S3 bucket: $S3_BUCKET${NC}"
fi

# Navigate to Next.js directory
cd visurena-next

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build the project
echo -e "${YELLOW}Building production version...${NC}"
npm run build

# Export static files
echo -e "${YELLOW}Exporting static files...${NC}"
npm run export

# Deploy to S3
echo -e "${YELLOW}Deploying to S3...${NC}"
aws s3 sync out/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache if distribution ID is set
if [ ! -z "$CLOUDFRONT_DIST_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Visit: https://$S3_BUCKET${NC}"