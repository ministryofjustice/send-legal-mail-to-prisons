# Manual CJSM directory upload

## Status

In order to refresh the CJSM directory, you must upload the CJSM directory csv into an S3 bucket.

This would benefit from some automation but we have no solution in place to automatically retrieve the CJSM directory csv from CJSM.

## Context

We have a table in our database containing each CJSM user and details such as organisation. CJSM were unable to offer us any API access to their data and timescales quoted for developing such an API were very long. 

The only solution offered by CJSM was to manually send us a csv file via email on an ad hoc basis.

## Decision

Given the lack of an automated solution from CJSM we decided to manually upload the CJSM directory csv into an S3 bucket where it is picked up by a batch job to refresh the CJSM database.

A ticket was raised to find another way to automate this process but was not completed.

## Consequences

We need a developer with access to Kubernetes to manually upload the CJSM directory csv into an S3 bucket (this process is documented in the README).

With hindsight we should have created a more user-friendly solution that didn't rely on a developer to perform the upload.

It is worth noting that an out of date CJSM directory only means we cannot report the legal sender's organisation to mailroom staff. However this can probably be inferred from the sender's email address if required.