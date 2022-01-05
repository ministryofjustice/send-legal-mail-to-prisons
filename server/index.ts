import express from 'express'
import { TelemetryClient } from 'applicationinsights'
import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import TokenStore from './data/tokenStore'
import MagicLinkService from './services/link/MagicLinkService'
import ScanBarcodeService from './services/scan/ScanBarcodeService'
import CreateBarcodeService from './services/barcode/CreateBarcodeService'
import AppInsightsService from './services/AppInsightsService'
import PrisonRegisterService from './services/prison/PrisonRegisterService'

const app = (appInsightsTelemetryClient?: TelemetryClient): express.Application => {
  const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
  const userService = new UserService(hmppsAuthClient)
  const magicLinkService = new MagicLinkService(hmppsAuthClient)
  const scanBarcodeService = new ScanBarcodeService(hmppsAuthClient)
  const createBarcodeService = new CreateBarcodeService()
  const prisonRegisterService = new PrisonRegisterService()
  const appInsightsService = new AppInsightsService(appInsightsTelemetryClient)

  return createApp(
    userService,
    magicLinkService,
    scanBarcodeService,
    createBarcodeService,
    prisonRegisterService,
    appInsightsService
  )
}

export default app
