import express, { Express, Router } from 'express'
import MagicLinkService from '../../services/link/MagicLinkService'
import VerifyLinkController from '../../routes/link/VerifyLinkController'
import setUpRequestLink from './setupRequestLink'
import setupLinkEmailSent from './setupLinkEmailSent'
import setUpVerifyLink from './setupVerifyLink'

export default function setUpLink(app: Express, magicLinkService: MagicLinkService): Router {
  const router = express.Router()

  const verifyLinkController = new VerifyLinkController(magicLinkService)

  app.use('/link', setUpRequestLink(magicLinkService, verifyLinkController))
  app.use('/link', setupLinkEmailSent())
  app.use('/link', setUpVerifyLink(verifyLinkController))

  return router
}
