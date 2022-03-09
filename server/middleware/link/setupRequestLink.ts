import express, { Router } from 'express'
import RequestLinkController from '../../routes/link/RequestLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'
import VerifyLinkController from '../../routes/link/VerifyLinkController'

export default function setUpRequestLink(
  magicLinkService: MagicLinkService,
  verifyLinkController: VerifyLinkController
): Router {
  const router = express.Router()
  const requestLinkController = new RequestLinkController(magicLinkService, verifyLinkController)

  router.get('/request-link', (req, res) => requestLinkController.getRequestLinkView(req, res))
  router.post('/request-link', (req, res) => requestLinkController.submitLinkRequest(req, res))

  return router
}
