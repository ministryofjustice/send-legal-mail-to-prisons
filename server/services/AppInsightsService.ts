import { TelemetryClient } from 'applicationinsights'

export default class AppInsightsService {
  constructor(private readonly appInsightsTelemetryClient?: TelemetryClient) {}

  trackEvent = (event: string): void => {
    this.appInsightsTelemetryClient?.trackEvent({ name: event })
  }
}
