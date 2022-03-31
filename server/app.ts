import express from 'express'

import createError from 'http-errors'

import cookieParser from 'cookie-parser'
import indexRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import type UserService from './services/userService'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import MagicLinkService from './services/link/MagicLinkService'
import barcodeAuthorisationMiddleware from './middleware/barcode/barcodeAuthorisationMiddleware'
import setUpCreateBarcode from './middleware/barcode/setupBarcode'
import populateBarcodeUser from './middleware/barcode/populateBarcodeUser'
import setupScanBarcode from './middleware/scan/setupScanBarcode'
import requestLinkAuthorised from './middleware/link/requestLinkAuthorised'
import ScanBarcodeService from './services/scan/ScanBarcodeService'
import CreateBarcodeService from './services/barcode/CreateBarcodeService'
import AppInsightsService from './services/AppInsightsService'
import PrisonRegisterService from './services/prison/PrisonRegisterService'
import GotenbergClient from './data/gotenbergClient'
import setupPdfRenderer from './middleware/setupPdfRenderer'
import ContactService from './services/contacts/ContactService'
import RecipientFormService from './routes/barcode/recipients/RecipientFormService'
import setupContactHelpdesk from './middleware/helpdesk/setupContactHelpdesk'
import setupCookiesPolicy from './middleware/cookies/setupCookiesPolicy'
import setupCsrf from './middleware/setupCsrf'
import setupLegalSenderStartPage from './middleware/start/setupLegalSenderStartPage'
import ZendeskService from './services/helpdesk/ZendeskService'
import contactHelpdeskAuthorisationMiddleware from './middleware/helpdesk/contactHelpdeskAuthorisationMiddleware'
import setUpLink from './middleware/link/setUpLink'
import SmokeTestStore from './data/cache/SmokeTestStore'
import setupSmokeTest from './middleware/smoketest/SmokeTestMiddleware'
import CjsmService from './services/cjsm/CjsmService'

export default function createApp(
  userService: UserService,
  magicLinkService: MagicLinkService,
  scanBarcodeService: ScanBarcodeService,
  createBarcodeService: CreateBarcodeService,
  prisonRegisterService: PrisonRegisterService,
  appInsightsClient: AppInsightsService,
  contactService: ContactService,
  recipientFormService: RecipientFormService,
  zendeskService: ZendeskService,
  cjsmService: CjsmService
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

  const smokeTestStore = new SmokeTestStore()
  app.use(setupSmokeTest(smokeTestStore))

  app.use(setupCsrf())
  app.use(setupCookiesPolicy())

  // no authentication
  app.get('/privacy-policy', (req, res) => res.render('pages/privacy-policy/privacy-policy'))
  app.use('/start', setupLegalSenderStartPage())
  app.use('/link', requestLinkAuthorised())
  app.use('/link', setUpLink(app, magicLinkService))
  app.use('/contact-helpdesk', setupContactHelpdesk(zendeskService))

  // authenticated with createBarcodeToken
  app.use('/barcode', barcodeAuthorisationMiddleware())
  app.use('/barcode', populateBarcodeUser(cjsmService))
  app.use(
    '/barcode',
    setUpCreateBarcode(createBarcodeService, prisonRegisterService, contactService, recipientFormService)
  )

  // authenticated by passport / HMPPS Auth
  app.use('/', setUpAuthentication())

  // Contact Helpdesk (for mailroom users) *MUST* be configured here. The authorisation middleware is subtly differ to the main
  // authorisation middleware so must be defined before the / route. The route '/scan-barcode/contact-helpdesk' must also be defined
  // before the call to standardRouter to prevent 404's for non authenticated users.
  app.use(
    '/scan-barcode/contact-helpdesk',
    contactHelpdeskAuthorisationMiddleware(['ROLE_SLM_SCAN_BARCODE', 'ROLE_SLM_SECURITY_ANALYST'])
  )
  app.use('/scan-barcode/contact-helpdesk', setupContactHelpdesk(zendeskService))

  app.use('/', indexRoutes(standardRouter(userService, smokeTestStore)))
  app.use('/', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE', 'ROLE_SLM_SECURITY_ANALYST']))

  app.use('/', setupScanBarcode(scanBarcodeService, prisonRegisterService, appInsightsClient))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
