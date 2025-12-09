# Send legal mail to prisons

[![pipeline](https://github.com/ministryofjustice/send-legal-mail-to-prisons/actions/workflows/pipeline.yml/badge.svg)](https://github.com/ministryofjustice/send-legal-mail-to-prisons) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## About
A Typescript application to allow creating barcodes for legal mail (aka rule39 mail).

### Team
This application is live, it is currently managed by the Visits [#ask-visits](https://moj.enterprise.slack.com/archives/C01DU5U4NMU) team.

### Health
The application has a health endpoint found at `/health` which indicates if the app is running and is healthy.

### Ping
The application has a ping endpoint found at `/ping` which indicates that the app is responding to requests.

### Maintenance pages
If the application needs planned (or unplanned!) downtime we have a method for displaying maintenance pages for both Send legal mail and Check Rule39 mail. See the guide at `maintenance_pages/README.md`.

### Build
<em>Requires membership of Github team `hmpps-send-legal-mail-live`</em>

### Versions
The application version currently running can be found on the `/health` endpoint at node `build.buildNumber`. The format of the version number is `YYY-MM-DD.ccc.gggggg` where `ccc` is the Circle job number and `gggggg` is the git commit reference. 

### Rolling back the application

* <em>Requires CLI tools `kubectl` and `helm`</em>
* <em>Requires access to Cloud Platform Kubernetes `live` cluster</em>
* <em>Requires membership of Github team `hmpps-send-legal-mail-live`</em>

For example in the dev environment:
1. Set the Kube context with command `kubectl config use-context live.cloud-platform.service.justice.gov.uk`
2. Set the Kube namespace with command `kubectl config set-context --current --namespace send-legal-mail-to-prisons-dev`
3. List the charts deployed by helm with command `helm list`
4. List the deployments for this application with command `helm history send-legal-mail-to-prisons`
5. Given the application version you wish to rollback to, find the related revision number
6. Rollback to that version with command `helm rollback send-legal-mail-to-prisons <revision-number>` replacing `<revision-number>` as appropriate

### Architecture Decision Records

Interesting or non-standard architectural decisions have been documented [here](adr/README.md).

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

Note that this will require running up the API first. See the [API Readme](https://github.com/ministryofjustice/send-legal-mail-to-prisons-api#running-the-app).

See `http://localhost:3000/health` to check the app is running.

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* nomis-user-roles-api - for authentication
* redis - session store and token caching
* gotenberg - for creating pdfs

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up redis hmpps-auth nomis-user-roles-api gotenberg`

Install dependencies using `npm run setup`, ensuring you are using >= `Node v24.x`. If you have an M1 MacBook you may need to run the following `brew` command before `canvas` will install: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

Create a `.env` which should override environment variables required to run locally:
```properties
HMPPS_AUTH_URL=http://localhost:9090/auth
NODE_ENV=development
SESSION_SECRET=anything
PORT=3000
SEND_LEGAL_MAIL_API_URL=http://localhost:8080
PRISON_REGISTER_API_URL=https://prison-register-dev.hmpps.service.justice.gov.uk
ONE_TIME_CODE_AUTH_ENABLED=true
```

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

#### Also running the API for development

This app needs the `send-legal-mail-to-prisons-api` project too which provides the back end for the front end.

See the [API Readme](https://github.com/ministryofjustice/send-legal-mail-to-prisons-api#running-the-app-for-development---gradle) for instructions to run the API for development too.

#### How do I sign is as a legal mail sender?

Visit URL `http://localhost:3000/barcode/find-recipient` which should redirect to the `Request a code to sign in` page. Enter any email address that ends with `cjsm.net`.

Open mailcatcher at `http://localhost:1080`. Open the first email which should contain a link - click on the link and you will be signed in.

## Run linter

`npm run lint`

## Run tests

`npm run test`

## Running integration tests

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

## Smoke Tests

Smoke tests are run in both the dev and preprod environments as part of the CircleCI build. These perform a regression test for both the legal sender and mailroom staff journeys.

If these tests pass we have a high level of confidence that the most valuable user journeys are working as expected. This should help inform decisions about promoting a change to production.

Further details are available in the [smoke tests README](https://github.com/ministryofjustice/send-legal-mail-to-prisons/tree/main/smoke_tests).

### :warning: Failing Smoke Tests - Circle CI IPs?

For the smoke tests to work on dev and preprod we added [Circle IP ranges](https://circleci.com/docs/2.0/ip-ranges) to our ingress allow lists.

If the smoke tests fail with a 403 then this is possibly because the list of allowed IPs has changed.

Check the `allowlist` config in `helm_deploy/values-dev.yaml` and `helm_deploy/values-preprod.yaml` and compare them to the [Circle CI IP ranges](https://circleci.com/docs/2.0/ip-ranges#list-of-ip-address-ranges).

## Dependency Checks

Dependency checks are run in a nightly job on CircleCI. See job `check_outdated` in `.circleci/config.yml`

### Vulnerable dependencies
To find any dependencies with vulnerabilities run command:

`npm audit`

#### Automated vulnerability checks

Various security checks are run in a nightly job in GitHub actions, see the `./github/workflows/` folder.

## Test Coverage Reports
We use jest code coverage to report on test coverage and produce reports for the unit tests.

Code coverage verification is not included in any GitHub or CircleCI checks. The reports are there for developers to monitor and look for gaps in test coverage or areas where we could improve tests. It will not be used as a stick to beat developers with due to the many failings of this approach.

### Where are the code coverage reports?
In the [CircleCI builds](https://app.circleci.com/pipelines/github/ministryofjustice/send-legal-mail-to-prisons?filter=all) find a `unit_test` job and click on the `ARTIFACTS` tab.

The unit test coverage report can be found at `test_results/jest/coverage/lcov-report/index.html`.

## Alerting and monitoring

Our main APM is Application Insights which we use for monitoring our logs, metrics, requests, traces and exceptions.

There are also a few useful resources in Prometheus and Grafana that are provided by the community for free. 

### Application Insights

As with most of HMPPS we primarily use [Application Insights](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/resource/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourceGroups/nomisapi-prod-rg/providers/Microsoft.Insights/components/nomisapi-prod/logs) to monitor our applications.

To use App Insights you need an account creating by the DSO team.

#### Saved Queries

In App Insights / Logs we have a bunch of saved queries that all have the prefix `SLM_`.

The value of individual queries may diminish over time but they provide great examples of how to access our monitoring data.

#### Developer's Dashboard

The [developer's dashboard](https://portal.azure.com/#@nomsdigitechoutlook.onmicrosoft.com/dashboard/arm/subscriptions/a5ddf257-3b21-4ba9-a28c-ab30f751b383/resourcegroups/dashboards/providers/microsoft.portal/dashboards/a97bbfa3-0c53-4ee2-b2e8-814bd813c649) was created to help us answer various questions about how our application was being used during the alpha / beta phases.

It remains a useful resource as an example of how to write App Insights Logs queries. 

### Community Grafana dashboards

Some [generic dashboards exist in Cloud Platform](https://github.com/ministryofjustice/cloud-platform-environments/tree/main/namespaces/live.cloud-platform.service.justice.gov.uk/monitoring) that give valuable insights into our apps.

These Grafana dashboards can be accessed using your GitHub account (requires membership of the ministryofjustice org).

#### Golden signals dashboard

The generic Golden Signals dashboard contains some basic metrics about networking and resource usage.

See the prod UI dashboard [here](https://grafana.live.cloud-platform.service.justice.gov.uk/d/golden-signals/golden-signals?orgId=1&var-namespace=send-legal-mail-to-prisons-prod&var-service=send-legal-mail-to-prisons).

#### Redis dashboard

The [generic Redis dashboard](https://grafana.live.cloud-platform.service.justice.gov.uk/d/nK7rpiQZk/aws-elasticache-redis?var-datasource=Cloudwatch&var-region=default&var-cacheclusterId=cp-1c81317764fca743-001&var-cachenodeid=0001) contains some basic metrics about Redis. 

To find the CacheClusterId for our Redis instances check Kubernetes secrets `slmtp-api-elasticache-redis` and `slmtp-ui-elasticache-redis`.

#### RDS dashboard

The [generic RDS dashboard](https://grafana.live.cloud-platform.service.justice.gov.uk/d/VR46pmwWk/aws-rds?orgId=1&var-datasource=Cloudwatch&var-region=default&var-dbinstanceidentifier=cloud-platform-aacf20ac20de771c) contains some basic metrics about our Postgres database running on RDS. 

To find the DBInstanceIdentifier for our RDS instances check Kubernetes secret `rds-instance-output`.

### Standard alerts

By using the standard [HMPPS Helm charts](https://github.com/ministryofjustice/hmpps-helm-charts/tree/main/charts/generic-prometheus-alerts) we get some alerts about our apps for free.

These alerts have been configured to send Slack messages to the `#send-legal-mail-alerts` channel (the alert channel is configured in `values-prod.yaml`).

#### Ingress alerts

The [generic ingress alerts](https://github.com/ministryofjustice/hmpps-helm-charts/blob/main/charts/generic-prometheus-alerts/templates/ingress-alerts.yaml) will notify us if we are returning 5XX errors or rate limiting any of our clients. 

#### Kubernetes alerts

The [generic application alerts](https://github.com/ministryofjustice/hmpps-helm-charts/blob/main/charts/generic-prometheus-alerts/templates/application-alerts.yaml) will notify us if our Kube pods are failing for various reasons, e.g. crash looping, OOM killed, pod not starting etc.

### Pingdom alerts

Along with most of HMPPS we use [Pingdom](https://github.com/ministryofjustice/cloud-platform-environments/blob/main/namespaces/live.cloud-platform.service.justice.gov.uk/send-legal-mail-to-prisons-prod/resources/pingdom.tf) to monitor our production apps from outside of our network.

These alerts are configured to send Slack messages to the `#send-legal-mail-alerts` channel if our UI is not responding.

### Performance benchmark alerts

We have some alerts that are fired if the performance benchmark test for the API indicates we have introduced a performance issue. These are sent to the `#send-legal-mail-alerts` Slack channel.

See the [API's performance benchmark documentation](https://github.com/ministryofjustice/send-legal-mail-to-prisons-api/tree/main/artillery#benchmark-performance-tests) for more details.

### Querying App Insights to trace a user journey
The use case for tracing the requests for a specific user journey is often based around investigating an error of some 
sort discovered in the logs of either the API or UI. IE an error will have been seen in the logs and you want to 
understand the user journey (requests / screens seen before and after the error) that led to the error.

Records in App Insights have an `operation_Id` field which can be used as a correlation ID to cross reference data across
the various App Insights tables / data sources. The `operation_Id` can be used as the starting point to query the data to 
understand the user journey or behaviour.

#### Obtaining the `operation_Id`
The following query can be used to show all requests for the `/oneTimeCode/verify` API endpoint that have failed, sorted by
timestamp and showing the `operation_Id`:
```
requests
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where name == 'POST /oneTimeCode/verify'
| where success == 'False'
| project timestamp, name, resultCode, operation_Id
| order by timestamp desc 
```
It might return:
```
timestamp [UTC]            name                      resultCode  operation_Id
3/3/2022, 1:31:55.668 PM   POST /oneTimeCode/verify  404         e32191a9b4464d3ab7cb781ada74c484
3/2/2022, 4:21:50.339 PM   POST /oneTimeCode/verify  404         9f073edae6be406fa3ae0c4a0a7c7451
3/2/2022, 1:31:51.738 PM   POST /oneTimeCode/verify  404         0242e48653dd4ebe8e43c69422b85736
3/2/2022, 1:25:52.193 PM   POST /oneTimeCode/verify  404         ffd6f247ce354b80845fb8e6d4df5474
3/2/2022, 1:23:17.463 PM   POST /oneTimeCode/verify  404         a842871a74a44d35991a275ef8de9b91
3/2/2022, 12:03:34.780 PM  POST /oneTimeCode/verify  404         4bdb0eecd4bb4d17a4532e5517679177
3/2/2022, 11:27:51.660 AM  POST /oneTimeCode/verify  404         8510fe92197d4991ba25c955a0b86bb4
3/1/2022, 4:07:58.473 PM   POST /oneTimeCode/verify  404         ae381bd10b9d470ea793107634278834
```

#### Obtaining the user journey with an `operation_Id`
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
3/2/2022, 4:21:50.433 PM   /oneTimeCode/request-code                     GET     200
3/2/2022, 4:21:50.323 PM   /oneTimeCode/verify-code                      GET     302
3/2/2022, 11:48:27.423 AM  /oneTimeCode/email-sent?showCookieConfirmatio GET     200
3/2/2022, 11:48:27.366 AM  /cookies-policy/preferences                   POST    302
3/2/2022, 11:47:35.873 AM  /oneTimeCode/email-sent                       GET     200
3/2/2022, 11:47:33.979 AM  /oneTimeCode/request-code                     POST    302
3/2/2022, 11:47:18.906 AM  /link/request-link                            GET     200
3/2/2022, 11:47:06.948 AM  /start                                        GET     200
```
The above tells us the user hit the start page at 11:47:06.948 and submitted (POST) a request for a code to sign-in at 
11:47:33.979, but didn't enter the code until 4:21:50.323. At this point the code would have expired and would be the 
root cause of the API error we are investigating (the 404 error from `/oneTimeCode/verify` at 4:21:50.339). We can see the 
user was then presented with the Request A Code page again.

## Troubleshooting Performance Issues

### How to recognise performance issues?

Performance issues are likely to manifest to the user as either the site running very slowly or responding with errors.

From a technical perspective this is likely to result in health checks failing, an increase in the number of 5XX errors or pods restarting frequently. We have alerts for all of these scenarios which are sent to Slack.

Check the [Golden signals dashboard](#golden-signals-dashboard) for both the UI and the API. This should give you a good overview of the error rates, latency, availability and pod restarts and help you diagnose when the problems started occurring.

### How to find the cause of performance issues?

#### Deployments

Check is if a recent deployment coincides with the start of the performance issues. 

In the Golden signals dashboard turn on the `service pod creation` button to give a visual indicator of deployments. Try [rolling back](#rolling-back-the-application) any helm releases that coincide with the start of the performance issues. If that works the problem was probably introduced by recent code changes which should be investigated.

#### Upstream dependencies

It's not unusual for HMPPS Auth to cause wider performance issues within HMPPS as it is a single point of failure. For example, Service X spams Auth preventing it from responding to other services causing a cascade of service failures.

Check the [DPS Monitor (vpn required)](https://dps-monitor.prison.service.justice.gov.uk/health) to see if other services are being affected. Check the [Auth health page](https://sign-in.hmpps.service.justice.gov.uk/auth/health) to make sure it's up. Look around on Slack to see if other people are reporting problems.

In this situation we are reliant on the `#hmpps-auth-audit-registers` team to investigate. If the outage looks like it will not be fixed quickly consider [turning on the maintenance pages](#maintenance-pages).

#### Database problems

Though projected volumes seem unlikely to cause database issues initially, this may become an issue over time.

##### AWS Cloudwatch Metrics

Check the [RDS dashboard](#rds-dashboard) to look for any anomalies. Some help understanding the meaning of each metric can be found in [AWS documentation](https://aws.amazon.com/blogs/database/making-better-decisions-about-amazon-rds-with-amazon-cloudwatch-metrics/).

For example, a low `FreeStorageSpace` might indicate this needs increasing with a [larger instance class](https://github.com/ministryofjustice/cloud-platform-environments/blob/main/namespaces/live.cloud-platform.service.justice.gov.uk/send-legal-mail-to-prisons-prod/resources/rds.tf#L13)

##### Micrometer Metrics

There are also some metrics collected from Spring in Application Insights Log Analytics which are useful for checking how the connection pool is performing. Run the following [query](https://portal.azure.com#@747381f4-e81f-4a43-bf68-ced6a1e14edf/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fa5ddf257-3b21-4ba9-a28c-ab30f751b383%2FresourceGroups%2Fnomisapi-prod-rg%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2Fnomisapi-prod/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAA2XLsQ0CMQwAwJ4prDRfeYQfAQoWQCaxiMGJX7Zf3zA8oqGhPl3dI22cOV1qnN5wdHaGqra329WULzQY1hWW4NlQ%252BUGKg0QxDTeXsBlImyy%252FOr8hkjzjkOxQnu1eC5j%252FS5cXuZQP0SMMCoMAAAA%253D/timespan/P1D) to see what metrics are available:
```Kusto Query Language
customMetrics
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where name startswith "jdbc" or name startswith "hikari"
```
For example, if `hikaricp_connections_pending` is constantly high you may need to consider tweaking the [hikari connection pool configuration](https://github.com/brettwooldridge/HikariCP#gear-configuration-knobs-baby) in your `application.yml` configuration properties.

##### App Insights Dependencies

Application Insights Log Analytics collects metrics from the JDBC drivers which may give some clues to badly performing queries. Run the following [query](https://portal.azure.com#@747381f4-e81f-4a43-bf68-ced6a1e14edf/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fa5ddf257-3b21-4ba9-a28c-ab30f751b383%2FresourceGroups%2Fnomisapi-prod-rg%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2Fnomisapi-prod/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAAz3LwQmAMAwF0LtT9NZTRugKHlxAiv3UQmxiUxHB4RUE7%252B8lKGpCXQpsuN25osEtLEeaJ2GMcYMLwXl7FTFyZNpiYepC2opJNYpa%252FF%252F7pV9QsZ4bbGf%252FAB%252BcKB9kAAAA/timespan/P1D) to see the metrics available:
```Kusto Query Language
dependencies
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where type == 'postgresql'
```
For example, if you notice that a particular query has a very high `duration` you may need to add an index to help its performance.

#### Redis cache problems

Though projected volumes seem unlikely to cause cache issues initially, this may become an issue if volumes increase.

##### AWS Cloudwatch Metrics

Check the [Redis dashboard](#redis-dashboard) to look for any anomalies. Some help understanding the metrics can be found in [AWS documentation](https://aws.amazon.com/blogs/database/monitoring-best-practices-with-amazon-elasticache-for-redis-using-amazon-cloudwatch/).

For example, if CPUUtilization is consistently high you may need to consider switching to a [larger instance class](https://github.com/ministryofjustice/cloud-platform-environments/blob/main/namespaces/live.cloud-platform.service.justice.gov.uk/send-legal-mail-to-prisons-prod/resources/elasticache-ui.tf#L14). 

##### Micrometer Metrics

There are also some metrics collected from Spring in Application Insights Log Analytics which are useful for checking the cache is performing. Run the following [query](https://portal.azure.com#@747381f4-e81f-4a43-bf68-ced6a1e14edf/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fa5ddf257-3b21-4ba9-a28c-ab30f751b383%2FresourceGroups%2Fnomisapi-prod-rg%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2Fnomisapi-prod/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAAz3LsQ3DMAwEwD5TsFPFETxCUmSBgJAfNgFKFEQKbjJ8kMbXX12R3p7IqTUeX7pOTFA1X%252Fvn7YaXNNC2UQn0nQ2HGDdR43QeU8N7sAwtd%252B3%252FECkz49I8qRgyV0X5AUVpgEFqAAAA/timespan/P1D) to see what metrics are available:
```Kusto Query Language
customMetrics
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where name startswith 'lettuce'
```
Some help understanding the metrics collected can be found in the [lettuce documentation](https://lettuce.io/core/release/reference/index.html#command.latency.metrics.micrometer).

##### App Insights Dependencies

Application Insights Log Analytics collects metrics from Redis which may give some clues. Run the following [query](https://portal.azure.com#@747381f4-e81f-4a43-bf68-ced6a1e14edf/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fa5ddf257-3b21-4ba9-a28c-ab30f751b383%2FresourceGroups%2Fnomisapi-prod-rg%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2Fnomisapi-prod/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAAz3LPQqAMAwG0N1TZOuUI%252FQKDl5ASvuhgfSHpiKCh1cQ3N9LaCgJJQpsuunc0UFR65HWpSrmkEHek7NXsWILyjmI8qjculgtxqGJ%252B%252Bu42hc6kph7AArIo01fAAAA/timespan/P1D) to see the metrics available:
```Kusto Query Language
dependencies
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where type == 'redis'
```
For example, if lots of queries have `success=False` we may be suffering from connection issues.

#### JVM problems

There could be problems with the JVM used in the API, such as running out of threads or memory.

Various JVM related metrics are pushed to Application Insights by Spring/Micrometer. Run the following [query](https://portal.azure.com#@747381f4-e81f-4a43-bf68-ced6a1e14edf/blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fa5ddf257-3b21-4ba9-a28c-ab30f751b383%2FresourceGroups%2Fnomisapi-prod-rg%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2Fnomisapi-prod/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAAz3LsQ2AQAgAwN4piI0VIziCFi5gyEsUwz%252FmQW0c3th4%252FaXTw%252FLAUSV588C9cWVIaucyT6Y8Umboe%252Bicy4LKKylmEsUwPKq4FUc6pPtr%252BYIH1fBbYoN2v3L7Ajaf6OtmAAAA/timespan/P1D) to see what metrics are available:
```Kusto Query Language
customMetrics
| where cloud_RoleName == 'send-legal-mail-to-prisons-api'
| where name startswith "jvm"
```
For example, if the memory usage is consistently high you may need to increase the memory allocated in the `helm_dploy/send-legal-mail-to-prisons-api/values.yaml` file env var `JAVA_OPTS`.
