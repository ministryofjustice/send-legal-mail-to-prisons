import express, { Express, Router } from 'express'
import setUpRequestOneTimeCode from './setupRequestOneTimeCode'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'
import VerifyOneTimeCodeController from '../../routes/one-time-code-auth/VerifyOneTimeCodeController'
import RequestOneTimeCodeController from '../../routes/one-time-code-auth/RequestOneTimeCodeController'
import setupOneTimeCodeEmailSent from './setupOneTimeCodeEmailSent'
import OneTimeCodeEmailSentController from '../../routes/one-time-code-auth/OneTimeCodeEmailSentController'
import setupVerifyOneTimeCode from './setupVerifyOneTimeCode'
import setupErrorPages from './setupErrorPages'
import config from '../../config'

export default function setUpOneTimeCode(app: Express, oneTimeCodeService: OneTimeCodeService): Router {
  const router = express.Router()

  const verifyOneTimeCodeController = new VerifyOneTimeCodeController(oneTimeCodeService)
  const requestOneTimeCodeController = new RequestOneTimeCodeController(oneTimeCodeService, verifyOneTimeCodeController)
  const oneTimeCodeEmailSentController = new OneTimeCodeEmailSentController()

  app.use('/oneTimeCode', (req, res, next) => {
    res.locals.oneTimeCodeValidityDuration = config.oneTimeCodeValidityDuration
    res.locals.lsjSessionDuration = `${config.lsjSessionDuration} day${config.lsjSessionDuration > 1 ? 's' : ''}`
    next()
  })

  app.use('/oneTimeCode', setUpRequestOneTimeCode(requestOneTimeCodeController))
  app.use('/oneTimeCode', setupOneTimeCodeEmailSent(oneTimeCodeEmailSentController))
  app.use('/oneTimeCode', setupVerifyOneTimeCode(verifyOneTimeCodeController))
  app.use('/oneTimeCode', setupErrorPages())

  return router
}
