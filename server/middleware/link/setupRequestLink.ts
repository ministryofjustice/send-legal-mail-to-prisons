import express, { Router } from 'express'
import RequestLinkController from '../../routes/link/RequestLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'

export default function setUpRequestLink(magicLinkService: MagicLinkService): Router {
  const router = express.Router()
  const requestLinkController = new RequestLinkController(magicLinkService)

  router.get('/request-link', (req, res) => requestLinkController.getRequestLinkView(req, res))
  router.post('/request-link', (req, res) => requestLinkController.submitLinkRequest(req, res))

  return router
}
