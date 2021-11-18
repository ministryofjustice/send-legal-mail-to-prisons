import express, { Router } from 'express'
import session from 'express-session'
import flash from 'connect-flash'
import RequestLinkController from '../../routes/link/RequestLinkController'
import config from '../../config'

export default function setUpRequestLink(): Router {
  const router = express.Router()
  const requestLinksController = new RequestLinkController()

  // TODO This uses the same max session age and secret as for a logged in user. Consider separating these into different env vars.
  router.use(
    session({
      cookie: { maxAge: config.session.expiryMinutes * 60000 },
      store: new session.MemoryStore(),
      saveUninitialized: true,
      resave: true,
      secret: config.session.secret,
    })
  )
  router.use(flash())
  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))

  router.get('/request-link', (req, res) => requestLinksController.getRequestLinkView(req, res))
  router.post('/request-link', (req, res) => requestLinksController.submitLinkRequest(req, res))

  return router
}
