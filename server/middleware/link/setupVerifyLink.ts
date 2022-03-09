import express, { Router } from 'express'
import VerifyLinkController from '../../routes/link/VerifyLinkController'

export default function setUpVerifyLink(verifyLinkController: VerifyLinkController): Router {
  const router = express.Router()

  router.get('/verify-link', (req, res) => verifyLinkController.verifyLink(req, res))

  return router
}
