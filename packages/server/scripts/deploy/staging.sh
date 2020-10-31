#! /usr/bin/env bash
set -ex

if [ -f ./.env.staging ]; then
  source ./.env.staging
else
  echo "ERROR: Make sure you have your environment variables setup for staging environment"
  exit
fi

# Building...
yarn build

# Copying .env.staging...
cp .env.staging .env.example ./build
mv ./build/.env.staging ./build/.env

# Deploying with AWS CDK...
yarn workspace @angora/aws deploy AngoraServerStackStaging \
  -c mode=staging \
  -c pkg=server \
  -c domainName=angoralabs-staging.dev \
  -c account='750496974065' \
  -c GITHUB_SHA=$GITHUB_SHA \
  --require-approval=never \
  --profile=angora-staging