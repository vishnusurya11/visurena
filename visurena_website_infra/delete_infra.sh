#!/bin/bash

STACK_NAME="visurena-website-infra"

echo "Deleting CloudFormation stack: $STACK_NAME..."
aws cloudformation delete-stack --stack-name "$STACK_NAME"

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME"

echo "Stack $STACK_NAME deleted successfully."
