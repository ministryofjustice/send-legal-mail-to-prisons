# Smoke Tests

## Automated Test Users

Tests that run against real environments are authenticated using namespace secrets `smoke-test/APP_SMOKETEST_MSJSECRET` and `smoke-test/APP_SMOKETEST_LSJSECRET` (where MSJ=mailroom staff journey and LSJ=legal sender journey).

For legal senders the secret can be used as an email address to gain access.

For mailroom staff the secret can be exchanged for a one time token by hitting endpoint `curl -XPOST http://localhost:3000/getSmokeTestSecret -H 'Content-Type: application/json' -d '{ "msjSecret": "<insert-secret-here>" }'`. You can then gain access for your test user by directing your browser to `http://localhost:3000/?smoke-test=<insert-token-here>`.
