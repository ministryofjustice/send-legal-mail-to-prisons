/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import recipientTableRowsFilter from '../filters/recipientTableRowsFilter'
import initialiseNameFilter from '../filters/initialiseNameFilter'
import findErrorFilter from '../filters/findErrorFilter'
import calculateDaysSinceCreationFilter from '../filters/calculateDaysSinceCreationFilter'
import renderEnvelopeSizeRadiosFilter from '../filters/renderEnvelopeSizeRadiosFilter'
import renderChooseBarcodeOptionRadiosFilter from '../filters/renderChooseBarcodeOptionRadiosFilter'
import renderChooseContactRadiosFilter from '../filters/renderChooseContactRadiosFilter'
import config from '../config'
import pageTitleInErrorFilter from '../filters/pageTitleInErrorFilter'
import formatDateFilter from '../filters/formatDateFilter'
import prisonsTableRowsFilter from '../filters/prisonsTableRowsFilter'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.use((req, res, next) => {
    app.locals.applicationName = 'Send legal mail to prisons'
    app.locals.gtmContainerId = config.slmContainerId

    // Set the values for the phase banner links from config
    app.locals.phaseBannerLink = config.phaseBannerLink.legalSenderJourney
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
      'node_modules/govuk-frontend/dist/',
      'node_modules/govuk-frontend/dist/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addFilter('initialiseName', initialiseNameFilter)
  njkEnv.addFilter('findError', findErrorFilter)
  njkEnv.addFilter('formatDate', formatDateFilter)
  njkEnv.addFilter('calculateDaysSinceCreation', calculateDaysSinceCreationFilter)
  njkEnv.addFilter('recipientTableRows', recipientTableRowsFilter)
  njkEnv.addFilter('renderEnvelopeSizeRadios', renderEnvelopeSizeRadiosFilter)
  njkEnv.addFilter('renderChooseBarcodeOptionRadiosFilter', renderChooseBarcodeOptionRadiosFilter)
  njkEnv.addFilter('renderChooseContactRadiosFilter', renderChooseContactRadiosFilter)
  njkEnv.addFilter('pageTitleInErrorFilter', pageTitleInErrorFilter)
  njkEnv.addFilter('prisonTableRowsFilter', prisonsTableRowsFilter)

  njkEnv.addGlobal('contactHelpdeskBannerExcludedOnPages', [
    'auth-error',
    'contact-helpdesk',
    'contact-helpdesk-submitted',
  ])

  return njkEnv
}
