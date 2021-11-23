import express, { Router } from 'express'
import flash from 'connect-flash'
import RequestLinkController from '../../routes/link/RequestLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'

export default function setUpRequestLink(magicLinkService: MagicLinkService): Router {
  const router = express.Router()
  const requestLinksController = new RequestLinkController(magicLinkService)

  router.use(flash())

  router.get('/request-link', (req, res) => requestLinksController.getRequestLinkView(req, res))
  router.post('/request-link', (req, res) => requestLinksController.submitLinkRequest(req, res))

  return router
}
