#!/usr/bin/env bash

DIR=/tmp/slm-smoke-test-dev
rmdir $DIR
mkdir -p $DIR
cp -r ../integration_tests/* $DIR
cp -n cypress.json package.json reporter-config.json $DIR
cd $DIR
npm install
export CYPRESS_APP_SMOKETEST_LSJSECRET=$(kubectl get secret smoke-test --template={{.data.APP_SMOKETEST_LSJSECRET}} | base64 -d)
export CYPRESS_APP_SMOKETEST_MSJSECRET=$(kubectl get secret smoke-test --template={{.data.APP_SMOKETEST_MSJSECRET}} | base64 -d)
export CYPRESS_APP_SMOKETEST_MSJAUTHCODE=$(curl -XPOST https://check-rule39-mail-dev.prison.service.justice.gov.uk/getSmokeTestSecret -H 'Content-Type: application/json' -d '{ "msjSecret": "$(echo $CYPRESS_APP_SMOKETEST_MSJSECRET)" }' | jq -r '.token')
export CYPRESS_UI_URL=https://send-legal-mail-dev.prison.service.justice.gov.uk
export CYPRESS_API_URL=https://check-rule39-mail-dev.prison.service.justice.gov.uk

node_modules/.bin/cypress run
