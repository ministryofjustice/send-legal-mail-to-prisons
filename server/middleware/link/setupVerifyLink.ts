import express, { Router } from 'express'
import VerifyLinkController from '../../routes/link/VerifyLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'

export default function setUpVerifyLink(magicLinkService: MagicLinkService): Router {
  const router = express.Router()
  const verifyLinkController = new VerifyLinkController(magicLinkService)

  router.get('/verify-link', (req, res) => verifyLinkController.verifyLink(req, res))

  return router
}
