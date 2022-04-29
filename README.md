# send-legal-mail-to-prisons

## About
A Typescript application to allow creating and scanning barcodes for legal mail (aka rule39 mail).

### Team
This application is in development by the Farsight Consulting team `Send legal mail to prisons`. They can be contacted on MOJ Slack channel `#prisoner_transactions_team`.

### Health
The application has a health endpoint found at `/health` which indicates if the app is running and is healthy.

### Ping
The application has a ping endpoint found at `/ping` which indicates that the app is responding to requests.

### Maintenance pages
If the application needs planned (or unplanned!) downtime we have a method for displaying maintenance pages for both Send legal mail and Check Rule39 mail. See the guide at `maintenance_pages/README.md`.

### Build
<em>Requires membership of Github team `farsight-devs`</em>

The application is built on [CircleCI](https://app.circleci.com/pipelines/github/ministryofjustice/send-legal-mail-to-prisons).

### Versions
The application version currently running can be found on the `/health` endpoint at node `build.buildNumber`. The format of the version number is `YYY-MM-DD.ccc.gggggg` where `ccc` is the Circle job number and `gggggg` is the git commit reference. 

### Rolling back the application

* <em>Requires CLI tools `kubectl` and `helm`</em>
* <em>Requires access to Cloud Platform Kubernetes `live` cluster</em>
* <em>Requires membership of Github team `farsight-devs`</em>

For example in the dev environment:
1. Set the Kube context with command `kubectl config use-context live.cloud-platform.service.justice.gov.uk`
2. Set the Kube namespace with command `kubectl config set-context --current --namespace send-legal-mail-to-prisons-dev`
3. List the charts deployed by helm with command `helm list`
4. List the deployments for this application with command `helm history send-legal-mail-to-prisons`
5. Given the application version you wish to rollback to, find the related revision number
6. Rollback to that version with command `helm rollback send-legal-mail-to-prisons <revision-number>` replacing `<revision-number>` as appropriate

## Imported Types
Some types are imported from the Open API docs for send-legal-mail-to-prisons-api and prison-register.

To update the types from the Open API docs run the following commands:

`npx openapi-typescript https://send-legal-mail-api-dev.prison.service.justice.gov.uk/v3/api-docs -output send-legal-mail-api.ts > server/@types/sendLegalMailApi/index.d.ts`

`npx openapi-typescript https://prison-register-dev.hmpps.service.justice.gov.uk/v3/api-docs -output prison-register-api.ts > server/@types/prisonRegisterApi/index.d.ts`

Note that you will need to run prettier over the generated files and possibly handle other errors before compiling.

The types are inherited for use in `server/@types/sendLegalMailApiClientTypes/index.d.ts` and `server/@types/prisonRegisterApiClientTypes/index.d.ts` which may also need tweaking for use.

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* nomis-user-roles-api - for authentication
* redis - session store and token caching
* prison-register - for returning details of prisons

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up redis hmpps-auth nomis-user-roles-api prison-register`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

Create a `.env` which should override environment variables required to run locally:
```properties
HMPPS_AUTH_URL=http://localhost:9090/auth
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
TOKEN_VERIFICATION_ENABLED=false
NODE_ENV=development
SESSION_SECRET=anything
PORT=3000
SEND_LEGAL_MAIL_API_URL=http://localhost:8080
PRISON_REGISTER_API_URL=https://prison-register-dev.hmpps.service.justice.gov.uk
```

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

#### Also running the API for development

This app needs the `send-legal-mail-to-prisons-api` project too which provides the back end for the front end.

See the [API Readme](https://github.com/ministryofjustice/send-legal-mail-to-prisons-api#running-the-app-for-development---gradle) for instructions to run the API for development too.

#### How do I sign is as a legal mail sender?

Visit URL `http://localhost:3000/barcode/find-recipient` which should redirect to the `Request a link to sign in` page. Enter any email address that ends with `cjsm.net`.

Open mailcatcher at `http://localhost:1080`. Open the first email which should contain a link - click on the link and you will be signed in.

#### How do I sign in as a mailroom staff user?

Visit URL `http://localhost:3000` which should redirect you to the HMPPS Auth sign in page. Enter credentials `SLM_MAILROOM_USER_LOCAL` / `password1234556`.

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`

### Writing integration tests

Integration tests use the [cypress test runner](https://www.cypress.io/).

#### Accessibility

Please use the Page superclass for all page models. By default, this will run an accessibility test every time the page 
is loaded. For further details see `integration_tests/pages/page.ts`

### Dependency Checks

Dependency checks are run in a nightly job on CircleCI. See job `check_outdated` in `.circleci/config.yml`

### Vulnerable dependencies
To find any dependencies with vulnerabilities run command:

`npm audit`

#### Automated vulnerability checks

Various security checks are run in a nightly job on CircleCI. See jobs `hmpps/npm_security_audit`, `hmpps/trivy_latest_scan` and `hmpps/veracode_pipeline_scan` in `.circleci/config.yml`.

### Update dependencies
To update all dependencies to their latest stable versions run command:

`npm update`

## Test Coverage Reports
We use jest code coverage to report on test coverage and produce reports for the unit tests.

Code coverage verification is not included in any GitHub or CircleCI checks. The reports are there for developers to monitor and look for gaps in test coverage or areas where we could improve tests. It will not be used as a stick to beat developers with due to the many failings of this approach.

### Where are the code coverage reports?
In the [CircleCI builds](https://app.circleci.com/pipelines/github/ministryofjustice/send-legal-mail-to-prisons?filter=all) find a `unit_test` job and click on the `ARTIFACTS` tab.

The unit test coverage report can be found at `test_results/jest/coverage/lcov-report/index.html`.

## Querying App Insights to trace a user journey
The use case for tracing the requests for a specific user journey is often based around investigating an error of some 
sort discovered in the logs of either the API or UI. IE an error will have been seen in the logs and you want to 
understand the user journey (requests / screens seen before and after the error) that led to the error.

Records in App Insights have an `operation_Id` field which can be used as a correlation ID to cross reference data across
the various App Insights tables / data sources. The `operation_Id` can be used as the starting point to query the data to 
understand the user journey or behaviour.

### Obtaining the `operation_Id`
The following query can be used to show all requests for the `/link/verify` API endpoint that have failed, sorted by
timestamp and showing the `operation_Id`:
```
requests
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where name == 'POST /link/verify'
| where success == 'False'
| project timestamp, name, resultCode, operation_Id
| order by timestamp desc 
```
It might return:
```
timestamp [UTC]            name               resultCode  operation_Id
3/3/2022, 1:31:55.668 PM   POST /link/verify  404         e32191a9b4464d3ab7cb781ada74c484
3/2/2022, 4:21:50.339 PM   POST /link/verify  404         9f073edae6be406fa3ae0c4a0a7c7451
3/2/2022, 1:31:51.738 PM   POST /link/verify  404         0242e48653dd4ebe8e43c69422b85736
3/2/2022, 1:25:52.193 PM   POST /link/verify  404         ffd6f247ce354b80845fb8e6d4df5474
3/2/2022, 1:23:17.463 PM   POST /link/verify  404         a842871a74a44d35991a275ef8de9b91
3/2/2022, 12:03:34.780 PM  POST /link/verify  404         4bdb0eecd4bb4d17a4532e5517679177
3/2/2022, 11:27:51.660 AM  POST /link/verify  404         8510fe92197d4991ba25c955a0b86bb4
3/1/2022, 4:07:58.473 PM   POST /link/verify  404         ae381bd10b9d470ea793107634278834
```

### Obtaining the user journey with an `operation_Id`
On the assumption you have an `operation_Id` a query can be performed to identify the specific web request and all other
web requests associated with the same IP, therefore giving a picture of the user journey.

Using the data from the previous section, let's assume we want to investigate the 2nd error. This happened at 4:21:50.339
and it's `operation_Id` was `9f073edae6be406fa3ae0c4a0a7c7451`. Execute the following query:
```
requests
| where cloud_RoleName == 'send-legal-mail-to-prisons'
| where operation_Id == '9f073edae6be406fa3ae0c4a0a7c7451'
| project client_IP
| join kind=inner requests on client_IP
| where not(name startswith "GET /assets/")
| project 
    timestamp, 
    url=replace_regex(url, @'https?://[^/]+(.+)', @'\1'),
    method=case(name startswith "GET ", "GET", "POST"), 
    resultCode
| order by timestamp desc 
```
This query works by querying the requests of `send-legal-mail-to-prisons` (the UI application) for the specified 
`operation_Id`. From that the `client_IP` is used in the subquery (the `join`) for all requests with the same IP.  
Requests to static resources in the `/assets/`path are filtered out, and then relevant columns are returned sorted by 
the request timestamp.
```
timestamp [UTC]	           url	                                         method  resultCode
3/2/2022, 4:21:50.433 PM   /link/request-link                            GET     200
3/2/2022, 4:21:50.323 PM   /link/verify-link?secret=<redacted>           GET     302
3/2/2022, 11:48:27.423 AM  /link/email-sent?showCookieConfirmation=true  GET     200
3/2/2022, 11:48:27.366 AM  /cookies-policy/preferences                   POST    302
3/2/2022, 11:47:35.873 AM  /link/email-sent                              GET     200
3/2/2022, 11:47:33.979 AM  /link/request-link                            POST    302
3/2/2022, 11:47:18.906 AM  /link/request-link                            GET     200
3/2/2022, 11:47:06.948 AM  /start                                        GET     200
```
The above tells us the user hit the start page at 11:47:06.948 and submitted (POST) a request fpr a link to sign-in at 
11:47:33.979, but didn't click the link until 4:21:50.323. At this point the link would have expired and would be the 
root cause of the API error we are investigating (the 404 error from `/link/verify` at 4:21:50.339). We can see the 
user was then presented with the Request A Link page again.
