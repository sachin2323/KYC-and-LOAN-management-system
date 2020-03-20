#!/bin/bash
mkdir -p cards
mkdir -p KeyStore
rm -rf ./KeyStore
rm -rf ./cards/*
echo "================Enrolling Network admin================"
node enroll-admin.js
echo "-------------------------------------------------"
echo "\n\n\n\n"

echo "================Registering Central Bank================"
node ./scripts/register-central-bank.js
echo "-------------------------------------------------"

echo "================Registering Insurer Org================"
node ./scripts/register-insurer.js
echo "-------------------------------------------------"
