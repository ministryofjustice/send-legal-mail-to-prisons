# Smoke Tests

## TODO
* Get PR in with only the server changes
* Working locally - get it working in Circle
* See if we can get Circle working with the run-slm-dev script
* See if we can have a single run script that accepts parameters for local/dev/preprod etc.
* Document how the tests work in Circle
* Document how to run the tests locally either against running projects or against dev/preprod
* Document how to run locally against projects while developing (e.g. how you have to set CYPRESS_APP_SMOKETEST_MSJAUTHCODE each run to refresh the token, that you have to run `./node_modules/.bin/cypress open` to open in Cypress)

## Automated Test Users

Tests that run against real environments are authenticated using namespace secrets `smoke-test/APP_SMOKETEST_MSJSECRET` and `smoke-test/APP_SMOKETEST_LSJSECRET` (where MSJ=mailroom staff journey and LSJ=legal sender journey).

For legal senders the secret can be used as an email address to gain access.

For mailroom staff the secret can be exchanged for a one time token by hitting endpoint `curl -XPOST http://localhost:3000/getSmokeTestSecret -H 'Content-Type: application/json' -d '{ "msjSecret": "<insert-secret-here>" }'`. You can then gain access for your test user by directing your browser to `http://localhost:3000/?smoke-test=<insert-token-here>`.
