/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { TelemetryClient } from 'applicationinsights'
import { initialiseAppInsights, buildAppInsightsClient } from './server/utils/azureAppInsights'
import applicationInfoSupplier from './server/applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
const appInsightsTelemetryClient: TelemetryClient = buildAppInsightsClient(applicationInfo)

import app from './server/index'
import logger from './logger'

const application = app(appInsightsTelemetryClient)
application.listen(application.get('port'), () => {
  logger.info(`Server listening on port ${application.get('port')}`)
})
