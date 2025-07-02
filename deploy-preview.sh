#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}ViSuReNa Deployment Preview Script${NC}"
echo "===================================="

# Check if we're in the right directory
if [ ! -d "visurena-next" ]; then
    echo -e "${RED}Error: visurena-next directory not found!${NC}"
    exit 1
fi

cd visurena-next

# Step 1: Install dependencies
echo -e "\n${YELLOW}Step 1: Installing dependencies...${NC}"
npm install

# Step 2: Build the project
echo -e "\n${YELLOW}Step 2: Building production version...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix errors before continuing.${NC}"
    exit 1
fi

# Step 3: Export static files
echo -e "\n${YELLOW}Step 3: Exporting static files...${NC}"
npm run export

if [ $? -ne 0 ]; then
    echo -e "${RED}Export failed! Please fix errors before continuing.${NC}"
    exit 1
fi

# Step 4: Start preview server
echo -e "\n${GREEN}Build successful! Starting preview server...${NC}"
echo -e "${YELLOW}Preview URL: http://localhost:8080${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the preview server${NC}\n"

# Serve the static files
npx serve out -p 8080

# After preview is stopped
echo -e "\n${YELLOW}Preview stopped. Would you like to deploy to production? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Deploying to production...${NC}"
    
    # Get S3 bucket name from user or config
    if [ -z "$S3_BUCKET" ]; then
        echo "Enter your S3 bucket name:"
        read -r S3_BUCKET
    fi
    
    # Sync to S3
    echo -e "${YELLOW}Syncing to S3...${NC}"
    aws s3 sync out/ s3://$S3_BUCKET --delete
    
    # Invalidate CloudFront cache
    if [ ! -z "$CLOUDFRONT_DIST_ID" ]; then
        echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"
    fi
    
    echo -e "\n${GREEN}Deployment complete!${NC}"
else
    echo -e "\n${YELLOW}Deployment cancelled. Files are still available in the 'out' directory.${NC}"
fi