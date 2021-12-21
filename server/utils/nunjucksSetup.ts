/* eslint-disable no-param-reassign */
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import moment from 'moment'
import path from 'path'

type Error = {
  href: string
  text: string
}

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Send Legal Mail To Prisons'

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

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('findError', (array: Error[], formFieldId: string) => {
    const item = array?.find(error => error.href === `#${formFieldId}`)
    return item ? { text: item.text } : null
  })

  njkEnv.addFilter('formatDateTimeForResultsPage', (value: string) => {
    const dateTime = moment(value)
    return dateTime ? dateTime.format('h:mm a [on] D MMMM YYYY') : null
  })

  njkEnv.addFilter('formatDateForResultsPage', (value: string) => {
    const dateTime = moment(value)
    return dateTime ? dateTime.format('D MMMM YYYY') : null
  })

  njkEnv.addFilter('calculateDaysSinceCreation', (value: string) => {
    const dateTime = moment(value)
    const now = moment()
    return dateTime ? now.diff(dateTime, 'days') : null
  })

  return njkEnv
}
