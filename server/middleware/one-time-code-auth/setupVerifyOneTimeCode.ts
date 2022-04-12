import express, { Router } from 'express'
import VerifyOneTimeCodeController from '../../routes/one-time-code-auth/VerifyOneTimeCodeController'

export default function setupVerifyOneTimeCode(verifyOneTimeCodeController: VerifyOneTimeCodeController): Router {
  const router = express.Router()

  router.post('/verify-code', (req, res) => verifyOneTimeCodeController.verifyOneTimeCode(req, res))

  return router
}
