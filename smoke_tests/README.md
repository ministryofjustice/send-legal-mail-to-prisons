# Smoke Tests

## Overview

We have a smoke test for both the Legal Sender Journey and the Mailroom Staff Journey in `integration_tests/smoke/smoke.spec.ts`. These run against the dev and preprod environments using secrets stored in Kubernetes under key `smoke-test`.

The smoke tests work by taking a copy of the `integration_tests` directory to re-use the existing Cypress config, overriding some configuration found in the `smoke_tests` and running the script `smoke_tests/run-smoke-test.sh` to perform the test.

In CircleCI the test script runs on a cypress Docker image. It copies the smoke test project into a temp directory, installs the necessary npm modules needed for Cypress and typescript and runs the Cypress tests.

## Running locally

(Note that this requires `kubectl` and `jq` to be installed locally.)

* Start up the API and UI's dependent containers.
* Start both the API and the UI with env vars `APP_SMOKETEST_LSJSECRET=terry` and `APP_SMOKETEST_MSJSECRET=bob`. 
* cd into the `smoke_tests` directory and run script `./run-smoke-test.sh`.

The smoke tests should run against local apps using the default parameters found in the script `run-smoke-test.sh`.

If the tests fail you can check the video produced in directory `/tmp/slm-smoke-test-local/videos`.

## Running in CircleCI

Smoke tests have been configured for dev and preprod and these can be found in `.circleci/config.yml` under job `run_smoke_test` which are run as part of the `build_test_deploy` pipeline.

### Running locally against dev or preprod

Follow the instructions for [running locally](#running-locally) but when calling `run-smoke-test.sh` add some parameters to override the env secrets and URLs. 

The tests will be run in directory `/tmp/slm-smoke-test-<env>` where <env> is passed as a parameter.

See the Circle job `run_smoke_test` in `.circleci/config.yml` for inspiration.

## Automated Test Users

Tests that run against real environments are authenticated using namespace secrets `smoke-test/APP_SMOKETEST_MSJSECRET` and `smoke-test/APP_SMOKETEST_LSJSECRET` (where MSJ=mailroom staff journey and LSJ=legal sender journey).

For legal senders the secret can be used as an email address to gain access.

For mailroom staff the secret can be exchanged for a one time token by hitting endpoint `curl -XPOST http://localhost:3000/getSmokeTestSecret -H 'Content-Type: application/json' -d '{ "msjSecret": "<insert-secret-here>" }'`. You can then gain access for your test user by directing your browser to `http://localhost:3000/?smoke-test=<insert-token-here>`.
