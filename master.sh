#!/bin/bash

set -ev

cd chaincode
./start.sh && ./install.sh
sleep 3
cd ..
cd client/src
npm install
rm -rf ./node_modules/fabric-client
cp -rf ../fabric-client ./node_modules
# docker-compose -f docker-compose.yaml up -d
./scripts/set-up-client.sh
npm start
