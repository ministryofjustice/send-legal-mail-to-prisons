# Split the UI into two apps

## Status

Internal users (a.k.a. Mailroom staff) and external users (a.k.a. Legal senders) have distinct UI functionality and authentication schemes yet they are all served by the same Node project.

Any historical justification for this no longer applies and each UI would be better off as its own project.

## Context

In the PoC we just lumped the internal and external UIs into a single project because it was throwaway code. When we started the real project we had to make a decision about whether to split the user journeys into two distinct Node apps.

At the time the decision was made it wasn't such an obvious choice as it now appears:
* the initial scope of the project included mail history views which looked very similar for both types of user
* there was a feeling that the project was too small to warrant the overhead of yet another microservice
* timescales for the MVP were very tight and we already had the dual authentication scheme in the PoC making it a convenient solution

## Decision

We decided to start with a single UI project and cater for both internal and external users.

The intention was to review this decision post-MVP and potentially split the UI into two projects.

## Consequences

With hindsight we should have split the UI into two applications from the start:

* the order of code in `server/app.ts` is very fragile to cater for the different authentication schemes
* there are several places in the code where we need to know which type of user is signed in, much of which is quite hacky
* we had to hand craft different ingresses for each type of user to cater for different URL hostnames meaning we couldn't use the generic ingress from HMPPS helm charts
* mail history was de-scoped anyway removing that line of misplaced justification
* in general the code would be cleaner had we split the projects early
