#! /usr/bin/env bash
set -ex

if [ -f ./.env.production ]; then
  source ./.env.production
else
  echo "ERROR: Make sure you have your environment variables setup for production environment"
  exit
fi

# Building...
yarn build

# Copying .env.production...
cp .env.production .env.example ./build
mv ./build/.env.production ./build/.env

# Deploying with AWS CDK...
yarn workspace @angora/aws deploy AngoraServerStackProduction \
  -c mode=production \
  -c pkg=server \
  -c domainName=angoralabs.com \
  -c account='101579480037' \
  -c GITHUB_SHA=$GITHUB_SHA \
  --require-approval=never \
  --profile=angora