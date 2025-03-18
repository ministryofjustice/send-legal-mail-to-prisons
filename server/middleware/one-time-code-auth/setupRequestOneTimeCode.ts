import express, { Router } from 'express'
import RequestOneTimeCodeController from '../../routes/one-time-code-auth/RequestOneTimeCodeController'

export default function setupRequestOneTimeCode(requestOneTimeCodeController: RequestOneTimeCodeController): Router {
  const router = express.Router()

  router.get('/request-code', (req, res) => requestOneTimeCodeController.getRequestOneTimeCodeView(req, res))
  router.post('/request-code', (req, res, next) =>
    requestOneTimeCodeController.submitOneTimeCodeRequest(req, res, next),
  )

  return router
}
