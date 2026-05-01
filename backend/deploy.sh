#!/bin/bash

echo "📦 1. Packaging Python dependencies..."
# Install requirements into a temporary 'package' folder
pip install -t package fastapi pydantic mangum > /dev/null

echo "🗜️ 2. Zipping the deployment file..."
cd package
zip -r ../deploy.zip . > /dev/null
cd ..
# Add your actual code to the zip file
zip -g deploy.zip main.py

echo "🔑 3. Creating AWS Security Role..."
# Tell AWS this role is specifically for Lambda
echo '{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}] }' > trust-policy.json

# Grab your AWS Account ID automatically
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create the role and attach DynamoDB permissions
aws iam create-role --role-name AxiomBackendRole --assume-role-policy-document file://trust-policy.json > /dev/null 2>&1
aws iam attach-role-policy --role-name AxiomBackendRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam attach-role-policy --role-name AxiomBackendRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

echo "⏳ Waiting 10 seconds for AWS permissions to propagate across their servers..."
sleep 10

echo "🚀 4. Deploying Serverless Function to ap-southeast-1..."
aws lambda create-function \
  --function-name AxiomBackend \
  --runtime python3.9 \
  --role arn:aws:iam::${ACCOUNT_ID}:role/AxiomBackendRole \
  --handler main.handler \
  --zip-file fileb://deploy.zip \
  --region ap-southeast-1 > /dev/null

echo "🌐 5. Generating Public Internet URL..."
# Create a live HTTP endpoint for the function
URL=$(aws lambda create-function-url-config --function-name AxiomBackend --auth-type NONE --region ap-southeast-1 --query FunctionUrl --output text)
# Allow anyone on the internet to hit this specific URL
aws lambda add-permission --function-name AxiomBackend --statement-id PublicAccess --action lambda:InvokeFunctionUrl --principal "*" --function-url-auth-type NONE --region ap-southeast-1 > /dev/null

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "Your live API is running at: $URL"
