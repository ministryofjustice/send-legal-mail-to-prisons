import { TelemetryClient } from 'applicationinsights'
import { performance } from 'perf_hooks'

export default class AppInsightsService {
  constructor(private readonly appInsightsTelemetryClient?: TelemetryClient) {}

  trackMetric = (metric: string): void => {
    this.appInsightsTelemetryClient?.trackMetric({ name: metric, value: performance.now() })
  }
}
