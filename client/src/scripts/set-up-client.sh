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

echo "================Registering Bank================"
node ./scripts/register-bank.js
echo "-------------------------------------------------"

echo "================Registering Buyer Admin================"
node ./scripts/register-buyer.js
echo "-------------------------------------------------"

echo "================Registering Seller Admin================"
node ./scripts/register-seller.js
echo "-------------------------------------------------"
