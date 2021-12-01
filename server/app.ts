import express from 'express'

import createError from 'http-errors'

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

export default function createApp(userService: UserService, magicLinkService: MagicLinkService): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)

  app.use('/barcode', barcodeAuthorisationMiddleware())
  app.use('/barcode', populateBarcodeUser())
  app.use('/barcode', setUpCreateBarcode())

  app.use('/link', setUpRequestLink(magicLinkService))
  app.use('/link', setUpVerifyLink(magicLinkService))

  app.use('/', setUpAuthentication())
  app.use('/', indexRoutes(standardRouter(userService)))
  app.use('/', authorisationMiddleware(['SLM_SCAN_BARCODE', 'SLM_SECURITY_ANALYST']))

  app.use('/', setupScanBarcode())

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
