# send-legal-mail-to-prisons

## About
A Typescript application to allow creating and scanning barcodes for legal mail (aka rule39 mail).

### Team
This application is in development by the Farsight Consulting team `Send legal mail to prisons`. They can be contacted on MOJ Slack channel `#prisoner_transactions_team`.

### Health
The application has a health endpoint found at `/health` which indicates if the app is running and is healthy.

### Ping
The application has a ping endpoint found at `/ping` which indicates that the app is responding to requests.

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
6. Rollback to that version with command `helm rollback <revision-number>` replacing `<revision-number>` as appropriate

## Imported Types
Some types are imported from the Open API docs for send-legal-mail-to-prisons-api.

To update the types from the Open API docs run the following command:

`npx openapi-typescript https://send-legal-mail-api-dev.prison.service.justice.gov.uk/v3/api-docs -output send-legal-mail-api.ts > server/@types/sendLegalMailApi/index.d.ts`

Note that you will need to run prettier over the file and possibly handle other errors before compiling.

The types are inherited for use in `server/@types/sendLegalMailApiClientTypes.ts` which may also need tweaking for use.

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up --scale app=0`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

Create a `.env` which should override environment variables required to run locally:
```properties
HMPPS_AUTH_URL=http://localhost:9090/auth
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
TOKEN_VERIFICATION_ENABLED=false
NODE_ENV=development
SESSION_SECRET=anything
PORT=3000
```

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

#### Also running the API for development

This app needs the `send-legal-mail-to-prisons-api` project too which provides the back end for the front end.

See the [API Readme](https://github.com/ministryofjustice/send-legal-mail-to-prisons-api#running-the-app-for-development---gradle) for instructions to run the API for development too.

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

To test a page rendering for accessibility issues, write a test that uses [cypress-axe](https://github.com/component-driven/cypress-axe).
For example:
```
  it('The page is accessible', () => {
    cy.visit('/the-page-url')

    cy.injectAxe()
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious'],
    })
  })
```

### Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`

### Vulnerable dependencies
To find any dependencies with vulnerabilities run command:

`npm audit`

### Update dependencies
To update all dependencies to their latest stable versions run command:

`npm update`