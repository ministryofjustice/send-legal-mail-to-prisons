import express from 'express'

import createError from 'http-errors'

import cookieParser from 'cookie-parser'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'

import { createRedisClient } from './data/redisClient'
import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import MagicLinkService from './services/link/MagicLinkService'
import barcodeAuthorisationMiddleware from './middleware/barcode/barcodeAuthorisationMiddleware'
import setUpCreateBarcode from './middleware/barcode/setupBarcode'
import populateBarcodeUser from './middleware/barcode/populateBarcodeUser'
import requestLinkAuthorised from './middleware/link/requestLinkAuthorised'
import CreateBarcodeService from './services/barcode/CreateBarcodeService'
import AppInsightsService from './services/AppInsightsService'
import GotenbergClient from './data/gotenbergClient'
import setupPdfRenderer from './middleware/setupPdfRenderer'
import ContactService from './services/contacts/ContactService'
import RecipientFormService from './routes/barcode/recipients/RecipientFormService'
import setupContactHelpdesk from './middleware/helpdesk/setupContactHelpdesk'
import setupCookiesPolicy from './middleware/cookies/setupCookiesPolicy'
import setupCsrf from './middleware/setupCsrf'
import setupLegalSenderStartPage from './middleware/start/setupLegalSenderStartPage'
import ZendeskService from './services/helpdesk/ZendeskService'
import setUpLink from './middleware/link/setUpLink'
import SmokeTestStore from './data/cache/SmokeTestStore'
import setupSmokeTest from './middleware/smoketest/SmokeTestMiddleware'
import CjsmService from './services/cjsm/CjsmService'
import config from './config'
import requestOneTimeCodeAuthorised from './middleware/one-time-code-auth/requestOneTimeCodeAuthorised'
import setUpOneTimeCode from './middleware/one-time-code-auth/setUpOneTimeCode'
import OneTimeCodeService from './services/one-time-code-auth/OneTimeCodeService'
import legalSenderJourneyAuthenticationStartPage from './middleware/legalSenderJourneyAuthenticationStartPage'
import PrisonService from './services/prison/PrisonService'

export default function createApp(
  magicLinkService: MagicLinkService,
  oneTimeCodeService: OneTimeCodeService,
  createBarcodeService: CreateBarcodeService,
  appInsightsClient: AppInsightsService,
  contactService: ContactService,
  recipientFormService: RecipientFormService,
  zendeskService: ZendeskService,
  cjsmService: CjsmService,
  prisonService: PrisonService,
): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(cookieParser())
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  app.use(setupPdfRenderer(new GotenbergClient()))
  nunjucksSetup(app)

  const smokeTestStore = new SmokeTestStore(createRedisClient())
  app.use(setupSmokeTest(smokeTestStore))

  app.use(setupCsrf())
  app.use(setupCookiesPolicy())

  // no authentication
  app.get('/privacy-policy', (req, res) => res.render('pages/privacy-policy/privacy-policy'))
  app.get('/accessibility-statement', (req, res) => res.render('pages/accessibility-statement/accessibility-statement'))
  app.use('/start', setupLegalSenderStartPage())
  app.use('/contact-helpdesk', setupContactHelpdesk(zendeskService))
  app.use('/legal-sender/sign-out', (req, res) =>
    res.redirect(`${legalSenderJourneyAuthenticationStartPage()}?force=true`),
  )

  if (config.featureFlags.lsjOneTimeCodeAuthEnabled) {
    app.use('/oneTimeCode', requestOneTimeCodeAuthorised())
    app.use('/oneTimeCode', setUpOneTimeCode(app, oneTimeCodeService))
    app.use('/link/request-link', (req, res) => res.redirect('/oneTimeCode/request-code'))
  } else {
    app.use('/link', requestLinkAuthorised())
    app.use('/link', setUpLink(app, magicLinkService, appInsightsClient))
  }

  // authenticated with createBarcodeToken
  app.use('/barcode', barcodeAuthorisationMiddleware())
  app.use('/barcode', populateBarcodeUser(cjsmService))
  app.use('/barcode', setUpCreateBarcode(createBarcodeService, prisonService, contactService, recipientFormService))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
