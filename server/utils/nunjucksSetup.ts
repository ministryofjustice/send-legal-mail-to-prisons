/* eslint-disable no-param-reassign */
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import path from 'path'
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
    const externalUrls = [
      '/link',
      '/oneTimeCode',
      '/barcode',
      '/contact-helpdesk',
      '/cookies-policy',
      '/privacy-policy',
    ]
    const externalUser =
      externalUrls.some(externalUrl => req.url.startsWith(externalUrl)) ||
      req.hostname.toLowerCase().startsWith('send-legal-mail')
    res.locals.externalUser = externalUser
    app.locals.externalUser = externalUser

    app.locals.applicationName = externalUser ? 'Send legal mail to prisons' : 'Check Rule 39 mail'
    app.locals.gtmContainerId = externalUser ? config.slmContainerId : config.checkRule39ContainerId

    // Set the values for the phase banner links from config
    app.locals.phaseBannerLink = externalUser
      ? config.phaseBannerLink.legalSenderJourney
      : config.phaseBannerLink.mailRoomJourney
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
