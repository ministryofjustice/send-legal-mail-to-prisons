import { RequestHandler } from 'express'
import type { VerifyErrors, JwtPayload } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import config from '../../config'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.barcodeUser = undefined

    if (!req.session.slmToken) {
      return res.redirect('/link/request-link')
    }

    const token = req.session.slmToken
    req.session.validSlmToken = false
    return verify(
      token,
      config.barcodeTokenPublicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors, payload: JwtPayload) => {
        if (err) {
          req.flash('errors', [
            { href: '#email', text: 'The link you used is no longer valid. Request a new one to sign in.' },
          ])
          return res.redirect('/link/request-link')
        }
        req.session.validSlmToken = true
        req.session.barcodeUserEmail = payload.sub
        // make the session expiry the same as the JWT - otherwise we lose the JWT when the session expires
        req.session.cookie.expires = new Date(payload.exp * 1000)
        return next()
      }
    )
  }
}
