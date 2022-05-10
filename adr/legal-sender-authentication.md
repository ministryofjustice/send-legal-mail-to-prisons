# External users authentication

## Status

Legal senders are authenticated by proving they have a CJSM email account. Once authenticated we provide our own JWT authentication token.

## Context

We received a non-negotiable requirement that legal senders would be authenticated by proving they have a CJSM email account. 

The main driver was to trust the CJSM onboarding/offboarding process rather than creating our own (which would have been very resource intensive).

We approached HMPPS Auth to see if we could add CJSM as a trusted authentication provider but this didn't fit with their strategic goals. They suggested we roll our own authentication solution. 

## Decision

We decided to implement a custom authentication solution and issue our own JWT auth tokens.

## Consequences

We manage a set of private/public keys in each environment that are used to sign our JWTs. These should probably be rotated occasionally. There are instructions in the README on how to regenerate the keys.

We have a custom user role (SLM_CREATE_BARCODE) that we assign to legal senders. Normally roles live in HMPPS Auth or DPS but legal senders don't interact with either so the role lives in this application only.
