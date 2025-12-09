#!/usr/bin/env bash

ENV='local'
LSJ_SECRET='terry'
MSJ_SECRET='bob'
LSJ_URL='http://localhost:3000'
MSJ_URL='http://localhost:3000'
CYPRESS_EXE=./node_modules/.bin/cypress

while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENV=$2
      shift # past argument
      shift # past value
      ;;
    --lsj-secret)
      LSJ_SECRET=$2
      shift # past argument
      shift # past value
      ;;
    --msj-secret)
      MSJ_SECRET=$2
      shift # past argument
      shift # past value
      ;;
    --lsj-url)
      LSJ_URL=$2
      shift # past argument
      shift # past value
      ;;
    --msj-url)
      MSJ_URL=$2
      shift # past argument
      shift # past value
      ;;
    --cypress-exe)
      CYPRESS_EXE=$2
      shift # past argument
      shift # past value
      ;;
  esac
done

DIR=/tmp/slm-smoke-test-$ENV
rm -rfv $DIR 2>/dev/null
mkdir -p $DIR
cp -r ../integration_tests/* $DIR
cp cypress.config.ts package.json package-lock.json .npmrc reporter-config.json run-smoke-test.sh $DIR
cd $DIR
npm run setup

export ENV=$ENV
export CYPRESS_APP_SMOKETEST_LSJSECRET=$LSJ_SECRET
export CYPRESS_APP_SMOKETEST_MSJSECRET=$MSJ_SECRET
export CYPRESS_LSJ_URL=$LSJ_URL
export CYPRESS_MSJ_URL=$MSJ_URL
export CYPRESS_APP_SMOKETEST_MSJAUTHCODE=$(curl -XPOST $MSJ_URL/getSmokeTestSecret -H 'Content-Type: application/json' -d "{ \"msjSecret\": \"$MSJ_SECRET\" }" | jq -r '.token')

# Determine whether the deployed environment that we are about to run the smoke tests against has OTC enabled or not
# We can do that by making a GET request for the magic link page - if we get a 200 then magic link is enabled, else OTC is enabled
if [ $(curl -XGET -s -o /dev/null -w "%{http_code}" $LSJ_URL/link/request-link) == 200 ]; then
  export CYPRESS_ONE_TIME_CODE_AUTH_ENABLED=false
else
  export CYPRESS_ONE_TIME_CODE_AUTH_ENABLED=true
fi

$CYPRESS_EXE run
