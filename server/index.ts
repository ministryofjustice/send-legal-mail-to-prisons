import express from 'express'
import { TelemetryClient } from 'applicationinsights'
import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import TokenStore from './data/cache/TokenStore'
import MagicLinkService from './services/link/MagicLinkService'
import ScanBarcodeService from './services/scan/ScanBarcodeService'
import CreateBarcodeService from './services/barcode/CreateBarcodeService'
import AppInsightsService from './services/AppInsightsService'
import PrisonRegisterService from './services/prison/PrisonRegisterService'
import PrisonRegisterStore from './data/cache/PrisonRegisterStore'
import ContactService from './services/contacts/ContactService'
import RecipientFormService from './routes/barcode/recipients/RecipientFormService'
import ZendeskService from './services/helpdesk/ZendeskService'
import CjsmService from './services/cjsm/CjsmService'
import OneTimeCodeService from './services/one-time-code-auth/OneTimeCodeService'
import SupportedPrisonsService from './services/prison/SupportedPrisonsService'
import PrisonService from './services/prison/PrisonService'

const app = (appInsightsTelemetryClient?: TelemetryClient): express.Application => {
  const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
  const userService = new UserService(hmppsAuthClient)
  const magicLinkService = new MagicLinkService(hmppsAuthClient)
  const oneTimeCodeService = new OneTimeCodeService(hmppsAuthClient)
  const scanBarcodeService = new ScanBarcodeService(hmppsAuthClient)
  const createBarcodeService = new CreateBarcodeService()
  const prisonRegisterService = new PrisonRegisterService(new PrisonRegisterStore())
  const appInsightsService = new AppInsightsService(appInsightsTelemetryClient)
  const contactService = new ContactService()
  const recipientFormService = new RecipientFormService(prisonRegisterService)
  const zendeskService = new ZendeskService()
  const cjsmService = new CjsmService()
  const supportedPrisonsService = new SupportedPrisonsService()
  const prisonService = new PrisonService(prisonRegisterService, supportedPrisonsService)

  return createApp(
    userService,
    magicLinkService,
    oneTimeCodeService,
    scanBarcodeService,
    createBarcodeService,
    appInsightsService,
    contactService,
    recipientFormService,
    zendeskService,
    cjsmService,
    prisonService
  )
}

export default app
