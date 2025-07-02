#!/bin/bash

# ViSuReNa Infrastructure Deployment Script
# Free Tier Optimized with Scalability

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
STACK_NAME="visurena-website-infrastructure"
TEMPLATE_FILE="cloudformation-template.yaml"
DOMAIN_NAME="visurena.com"
ENVIRONMENT="prod"

echo -e "${GREEN}🚀 ViSuReNa Infrastructure Deployment${NC}"
echo "======================================"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if template exists
if [ ! -f "$SCRIPT_DIR/$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ CloudFormation template not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Get ACM Certificate ARN (required for HTTPS)
echo -e "${YELLOW}📋 Checking for SSL Certificate...${NC}"
CERT_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='$DOMAIN_NAME'].CertificateArn" --output text)

if [ -z "$CERT_ARN" ]; then
    echo -e "${RED}❌ SSL Certificate not found for $DOMAIN_NAME${NC}"
    echo -e "${YELLOW}💡 Please create an ACM certificate in us-east-1 region first:${NC}"
    echo "   1. Go to AWS Certificate Manager (us-east-1)"
    echo "   2. Request a certificate for $DOMAIN_NAME and www.$DOMAIN_NAME"
    echo "   3. Validate the certificate"
    echo "   4. Run this script again"
    exit 1
fi

echo -e "${GREEN}✅ SSL Certificate found: $CERT_ARN${NC}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Stack exists. Updating...${NC}"
    OPERATION="update-stack"
else
    echo -e "${YELLOW}📦 Creating new stack...${NC}"
    OPERATION="create-stack"
fi

# Deploy the stack
echo -e "${YELLOW}🚀 Deploying infrastructure...${NC}"
aws cloudformation $OPERATION \
    --stack-name "$STACK_NAME" \
    --template-body "file://$SCRIPT_DIR/$TEMPLATE_FILE" \
    --parameters \
        ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
        ParameterKey=AcmCertificateArn,ParameterValue="$CERT_ARN" \
        ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
    --capabilities CAPABILITY_IAM \
    --tags \
        Key=Project,Value=ViSuReNa \
        Key=Environment,Value=$ENVIRONMENT \
        Key=CostCenter,Value=Website

# Wait for completion
echo -e "${YELLOW}⏳ Waiting for stack operation to complete...${NC}"
if [ "$OPERATION" = "create-stack" ]; then
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME"
else
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME"
fi

# Get outputs
echo -e "${YELLOW}📋 Getting stack outputs...${NC}"
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" --output text)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Stack Information:${NC}"
echo "  Stack Name: $STACK_NAME"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  CloudFront Distribution: $DISTRIBUTION_ID"
echo "  Website URL: $WEBSITE_URL"
echo ""
echo -e "${YELLOW}🔧 GitHub Secrets to Add:${NC}"
echo "  S3_BUCKET: $BUCKET_NAME"
echo "  CLOUDFRONT_DISTRIBUTION_ID: $DISTRIBUTION_ID"
echo ""
echo -e "${YELLOW}🌐 DNS Configuration (Point your domain to):${NC}"
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text)
echo "  CloudFront Domain: $CLOUDFRONT_DOMAIN"
echo "  📋 In your domain registrar, create a CNAME record:"
echo "     visurena.com → $CLOUDFRONT_DOMAIN"
echo "     www.visurena.com → $CLOUDFRONT_DOMAIN"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "  1. Add the GitHub secrets above to your repository"
echo "  2. Update DNS records in your domain registrar"
echo "  3. Push changes to main/master branch to trigger deployment"
echo "  4. Wait for DNS propagation (up to 48 hours)"
echo ""
echo -e "${GREEN}🎉 Your website infrastructure is ready!${NC}"

# Display cost estimate
echo -e "${YELLOW}💰 Estimated Monthly Cost (Free Tier):${NC}"
echo "  • S3 Storage (5GB): FREE"
echo "  • CloudFront (1TB transfer): FREE"
echo "  • Route 53 Hosted Zone: \$0.50/month"
echo "  • Total: ~\$0.50/month"
echo ""
echo -e "${YELLOW}📈 Scaling Costs (1000+ users/day):${NC}"
echo "  • Additional S3 storage: \$0.023/GB/month"
echo "  • Additional CloudFront transfer: \$0.085/GB"
echo "  • DynamoDB (on-demand): \$1.25 per million requests"
echo "  • Lambda (if needed): \$0.20 per million requests"