#!/bin/bash

# Variables (update these with your actual values)
STACK_NAME="visurena-website-infra"
TEMPLATE_FILE="visurena_infra.yaml"
DOMAIN_NAME="visurena.com"         # Replace with your domain name
HOSTED_ZONE_ID="Z0222553K89E0MXH3187"  # Replace with your actual Hosted Zone ID
STACK_SUFFIX="visurena"
PROJECT_TAG="VisurenaWebsite"       # Tag value to identify this project
ACM_CERTIFICATE_ARN="arn:aws:acm:us-east-1:597088058256:certificate/647c8d33-374e-48c7-b405-8905425c6eef"

echo "Creating CloudFormation stack: $STACK_NAME..."

aws cloudformation update-stack \
  --stack-name "$STACK_NAME" \
  --template-body "file://$TEMPLATE_FILE" \
  --parameters ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
               ParameterKey=HostedZoneId,ParameterValue="$HOSTED_ZONE_ID" \
               ParameterKey=StackNameSuffix,ParameterValue="$STACK_SUFFIX" \
               ParameterKey=ProjectTag,ParameterValue="$PROJECT_TAG" \
               ParameterKey=AcmCertificateArn,ParameterValue="$ACM_CERTIFICATE_ARN" \
  --capabilities CAPABILITY_NAMED_IAM

echo "Waiting for stack update to complete..."
aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME"

echo "Stack Updated successfully."
