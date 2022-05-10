# External users session length

## Status

We issue legal senders with JWT auth tokens that last 7 days.

## Context

In a bid to make the legal sender journey as frictionless as possible a long session time was required.

This is not best practise from a security perspective. This was pointed out by the developers, security team and PEN testers.

## Decision

A legal sender's session expires at midnight on the 7th day after it was requested. Midnight was chosen to minimise disruption to the legal sender journey.

## Consequences

Projected user needs trumped security concerns. The technical team on the project were very uncomfortable with this decision.