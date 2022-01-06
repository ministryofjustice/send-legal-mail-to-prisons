import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  Array.of(
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    '/node_modules/govuk-frontend/govuk/assets',
    '/node_modules/govuk-frontend',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
    '/node_modules/inputmask/dist/bindings',
    '/node_modules/inputmask/dist',
    '/node_modules/accessible-autocomplete/dist'
  ).forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/govuk_frontend_toolkit/images').forEach(dir => {
    router.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/jquery/dist/jquery.min.js').forEach(dir => {
    router.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/inputmask/dist/jquery.inputmask.js').forEach(dir => {
    router.use('/assets/js/jquery.inputmask.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  Array.of('/node_modules/inputmask/dist/bindings/inputmask.binding.js').forEach(dir => {
    router.use('/assets/js/inputmask.binding.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js').forEach(dir => {
    router.use('/assets/js/accessible-autocomplete.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  Array.of('/node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.css').forEach(dir => {
    router.use(
      '/assets/stylesheets/accessible-autocomplete.min.css',
      express.static(path.join(process.cwd(), dir), cacheControl)
    )
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
