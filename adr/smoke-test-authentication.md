# Smoke Test Authentication

## Status

The smoke tests do not use the standard authentication mechanism for either legal senders or mailroom staff.

## Context

Given that we were forced to use legal senders CJSM email to authenticate users we were unable to create any test users for smoke tests.

It would be possible to create a test DPS user for mailroom staff but that would need pinning to a real email address.

## Decision

We chose to create a custom auth mechanism for both kinds of user in the smoke tests. This auth mechanism is feature switched to only work in dev and preprod. 

## Consequences

The smoke tests do not test that the real authentication mechanisms are working.

We cannot turn on the custom auth mechanisms in production so the smoke tests are limited to dev and preprod.

On the plus side we have no smoke test users to manage and so a source of fragility is removed.

In an ideal world the smoke tests would be able to create and tear down test users on an ad hoc basis.
