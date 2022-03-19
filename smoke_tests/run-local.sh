#!/usr/bin/env bash

DIR=/tmp/slm-smoke-test-local
rmdir $DIR
mkdir -p $DIR
cp -r ../integration_tests/* $DIR
cp -n cypress.json package.json reporter-config.json $DIR
cd $DIR
npm install
export CYPRESS_APP_SMOKETEST_LSJSECRET=terry
export CYPRESS_APP_SMOKETEST_MSJSECRET=bob
export CYPRESS_APP_SMOKETEST_MSJAUTHCODE=$(curl -XPOST http://localhost:3000/getSmokeTestSecret -H 'Content-Type: application/json' -d '{ "msjSecret": "bob" }' | jq -r '.token')
export CYPRESS_UI_URL=http://localhost:3000
export CYPRESS_API_URL=http://localhost:3000
node_modules/.bin/cypress run
