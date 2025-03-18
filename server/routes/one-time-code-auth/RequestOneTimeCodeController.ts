import { NextFunction, Request, Response } from 'express'
import type { ErrorResponse } from 'sendLegalMailApiClient'
import RequestOneTimeCodeView from './RequestOneTimeCodeView'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'
import VerifyOneTimeCodeController from './VerifyOneTimeCodeController'
import config from '../../config'
import validate from './RequestOneTimeCodeValidator'

export default class RequestOneTimeCodeController {
  constructor(
    private readonly oneTimeCodeService: OneTimeCodeService,
    private readonly verifyOneTimeCodeController: VerifyOneTimeCodeController,
  ) {}

  getRequestOneTimeCodeView(req: Request, res: Response): void {
    const view = new RequestOneTimeCodeView(req.session?.requestOneTimeCodeForm || {}, req.flash('errors'))
    req.session.requestOneTimeCodeForm = undefined
    return res.render('pages/one-time-code-auth/requestOneTimeCode', { ...view.renderArgs })
  }

  async submitOneTimeCodeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    req.session.lsjSmokeTestUser = false
    if (config.smoketest.lsjSecret && req.body.email === config.smoketest.lsjSecret) {
      req.body = { code: config.smoketest.lsjSecret }
      req.session.lsjSmokeTestUser = true
      return this.verifyOneTimeCodeController.verifyOneTimeCode(req, res, next)
    }

    req.session.requestOneTimeCodeForm = { ...req.body }
    if (!validate(req.session.requestOneTimeCodeForm, req)) {
      return res.redirect('request-code')
    }

    try {
      await this.oneTimeCodeService.requestOneTimeCode(req.session.requestOneTimeCodeForm.email, req.sessionID, req.ip)
      return res.redirect('email-sent')
    } catch (error) {
      const errorResponse: ErrorResponse = error.data
      const errorMessage =
        error.status === 400 && Array.of('INVALID_CJSM_EMAIL', 'EMAIL_TOO_LONG').includes(errorResponse.errorCode.code)
          ? 'Enter an email address in the correct format'
          : 'There was an error generating your sign in code. Try again to request a new one to sign in.'
      req.flash('errors', [{ href: '#email', text: errorMessage }])
      return res.redirect('request-code')
    }
  }
}
