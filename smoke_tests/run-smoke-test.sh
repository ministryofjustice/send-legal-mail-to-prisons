#!/usr/bin/env bash

ENV='local'
LSJ_SECRET='terry'
MSJ_SECRET='bob'
LSJ_URL='http://localhost:3000'
MSJ_URL='http://localhost:3000'

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
  esac
done

DIR=/tmp/slm-smoke-test-$ENV
rmdir $DIR 2>/dev/null
mkdir -p $DIR
cp -r ../integration_tests/* $DIR
cp cypress.json package.json reporter-config.json run-smoke-test.sh $DIR
cd $DIR
npm install

export ENV=$ENV
export CYPRESS_APP_SMOKETEST_LSJSECRET=$LSJ_SECRET
export CYPRESS_APP_SMOKETEST_MSJSECRET=$MSJ_SECRET
export CYPRESS_LSJ_URL=$LSJ_URL
export CYPRESS_MSJ_URL=$MSJ_URL
export CYPRESS_APP_SMOKETEST_MSJAUTHCODE=$(curl -XPOST $MSJ_URL/getSmokeTestSecret -H 'Content-Type: application/json' -d "{ \"msjSecret\": \"$MSJ_SECRET\" }" | jq -r '.token')

node_modules/.bin/cypress run
