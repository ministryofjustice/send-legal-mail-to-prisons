import express, { Router } from 'express'
import OneTimeCodeEmailSentController from '../../routes/one-time-code-auth/OneTimeCodeEmailSentController'

export default function setupOneTimeCodeEmailSent(
  oneTimeCodeEmailSentController: OneTimeCodeEmailSentController
): Router {
  const router = express.Router()

  router.get('/email-sent', (req, res) => oneTimeCodeEmailSentController.getOneTimeCodeEmailSentView(req, res))

  return router
}
