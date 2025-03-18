import { NextFunction, Request, Response } from 'express'
import { JwtPayload, verify as verifyJwt, VerifyErrors } from 'jsonwebtoken'
import type { VerifyOneTimeCodeForm } from 'forms'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'
import config from '../../config'

export default class VerifyOneTimeCodeController {
  constructor(private readonly oneTimeCodeService: OneTimeCodeService) {}

  async verifyOneTimeCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    req.session.barcodeUser = { tokenValid: false, token: undefined }
    const form: VerifyOneTimeCodeForm = { ...req.body }
    if (!form?.code) {
      req.flash('errors', [{ href: '#code', text: 'Enter the code from your email.' }])
      return res.redirect('/oneTimeCode/email-sent')
    }

    let token: string
    try {
      token = await this.oneTimeCodeService.verifyOneTimeCode(form.code, req.sessionID, req.ip)
    } catch (error) {
      switch (error.data.errorCode.code) {
        case 'OTC_NOT_FOUND': {
          req.flash('errors', [{ href: '#code', text: 'Enter the code we emailed you. This is 4 letters, like DNLC' }])
          return res.redirect('/oneTimeCode/email-sent')
        }
        case 'OTC_SESSION_NOT_FOUND': {
          return res.redirect('/oneTimeCode/code-no-longer-valid')
        }
        case 'OTC_TOO_MANY_ATTEMPTS': {
          return res.redirect('/oneTimeCode/start-again')
        }
        default: {
          return next(error)
        }
      }
    }

    try {
      const payload = await this.verifyToken(token)
      req.session.barcodeUser.email = payload.sub
      req.session.barcodeUser.token = token
      req.session.barcodeUser.tokenValid = true
      // make the session expiry the same as the JWT - otherwise we lose the JWT when the session expires
      req.session.cookie.expires = new Date(payload.exp * 1000)
      const { id, ...sessionWithoutId } = req.session
      req.session.regenerate(() => {
        // put the old session back - but keep the new session ID
        Object.assign(req.session, sessionWithoutId)
      })
      return res.redirect('/barcode/find-recipient')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      req.flash('errors', [
        { href: '#email', text: 'The code you used is no longer valid. Request a new one to sign in.' },
      ])
      return res.redirect('/oneTimeCode/request-code')
    }
  }

  private verifyToken = (token: string): Promise<JwtPayload> => {
    return new Promise((resolve, reject) => {
      verifyJwt(
        token,
        config.barcodeTokenPublicKey,
        { algorithms: ['RS256'] },
        (err: VerifyErrors, payload: JwtPayload) => {
          if (err) {
            reject()
          } else {
            resolve(payload)
          }
        },
      )
    })
  }
}
