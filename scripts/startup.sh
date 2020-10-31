#! /usr/bin/env bash
set -ex

yarn --force

cd ./packages
cp server/.env.local server/.env
cp app/.env.local app/.env
cd ..

yarn update