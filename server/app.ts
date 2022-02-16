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
import setUpRequestLink from './middleware/link/setupRequestLink'
import setUpVerifyLink from './middleware/link/setupVerifyLink'
import MagicLinkService from './services/link/MagicLinkService'
import barcodeAuthorisationMiddleware from './middleware/barcode/barcodeAuthorisationMiddleware'
import setUpCreateBarcode from './middleware/barcode/setupBarcode'
import populateBarcodeUser from './middleware/barcode/populateBarcodeUser'
import setupScanBarcode from './middleware/scan/setupScanBarcode'
import setupLinkEmailSent from './middleware/link/setupLinkEmailSent'
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

export default function createApp(
  userService: UserService,
  magicLinkService: MagicLinkService,
  scanBarcodeService: ScanBarcodeService,
  createBarcodeService: CreateBarcodeService,
  prisonRegisterService: PrisonRegisterService,
  appInsightsClient: AppInsightsService,
  contactService: ContactService,
  recipientFormService: RecipientFormService
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
  app.use(setupCsrf())
  app.use(setupCookiesPolicy())

  // no authentication
  app.use('/start', setupLegalSenderStartPage())
  app.use('/link', requestLinkAuthorised())
  app.use('/link', setUpRequestLink(magicLinkService))
  app.use('/link', setupLinkEmailSent())
  app.use('/link', setUpVerifyLink(magicLinkService))
  app.use('/contact-helpdesk', setupContactHelpdesk())

  // authenticated with createBarcodeToken
  app.use('/barcode', barcodeAuthorisationMiddleware())
  app.use('/barcode', populateBarcodeUser())
  app.use(
    '/barcode',
    setUpCreateBarcode(createBarcodeService, prisonRegisterService, contactService, recipientFormService)
  )

  // authenticated by passport / HMPPS Auth
  app.use('/', setUpAuthentication())
  app.use('/', indexRoutes(standardRouter(userService)))
  app.use('/', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE', 'ROLE_SLM_SECURITY_ANALYST']))

  app.use('/', setupScanBarcode(scanBarcodeService, prisonRegisterService, appInsightsClient))
  app.use('/scan-barcode/contact-helpdesk', setupContactHelpdesk())

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
