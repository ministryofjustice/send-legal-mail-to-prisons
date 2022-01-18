/* eslint-disable no-param-reassign */
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import path from 'path'
import recipientTableRowsFilter from '../filters/recipientTableRowsFilter'
import initialiseNameFilter from '../filters/initialiseNameFilter'
import findErrorFilter from '../filters/findErrorFilter'
import calculateDaysSinceCreationFilter from '../filters/calculateDaysSinceCreationFilter'
import formatDateTimeForResultsPageFilter from '../filters/formatDateTimeForResultsPageFilter'
import formatDateForResultsPageFilter from '../filters/formatDateForResultsPageFilter'
import renderEnvelopeSizeRadiosFilter from '../filters/renderEnvelopeSizeRadiosFilter'
import renderChooseBarcodeOptionRadiosFilter from '../filters/renderChooseBarcodeOptionRadiosFilter'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.use((req, res, next) => {
    const externalUser = () => req.url.startsWith('/link') || req.url.startsWith('/barcode')
    app.locals.applicationName = externalUser() ? 'Send Legal Mail To Prisons' : 'Check Rule 39 mail'
    next()
  })

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  registerNunjucks(app)
}

export function registerNunjucks(app?: express.Express): Environment {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('initialiseName', initialiseNameFilter)
  njkEnv.addFilter('findError', findErrorFilter)
  njkEnv.addFilter('formatDateTimeForResultsPage', formatDateTimeForResultsPageFilter)
  njkEnv.addFilter('formatDateForResultsPage', formatDateForResultsPageFilter)
  njkEnv.addFilter('calculateDaysSinceCreation', calculateDaysSinceCreationFilter)
  njkEnv.addFilter('recipientTableRows', recipientTableRowsFilter)
  njkEnv.addFilter('renderEnvelopeSizeRadios', renderEnvelopeSizeRadiosFilter)
  njkEnv.addFilter('renderChooseBarcodeOptionRadiosFilter', renderChooseBarcodeOptionRadiosFilter)

  return njkEnv
}
