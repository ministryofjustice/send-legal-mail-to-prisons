import express, { Router } from 'express'
import LinkEmailSentController from '../../routes/link/LinkEmailSentController'

export default function setupLinkEmailSent(): Router {
  const router = express.Router()
  const linkEmailSentController = new LinkEmailSentController()

  router.get('/email-sent', (req, res) => linkEmailSentController.getLinkEmailSentView(req, res))

  return router
}
