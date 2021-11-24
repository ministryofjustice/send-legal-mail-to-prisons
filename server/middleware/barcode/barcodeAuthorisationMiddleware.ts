import { RequestHandler } from 'express'
import type { VerifyErrors, JwtPayload } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import config from '../../config'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.barcodeUser = undefined

    if (!req.session.createBarcodeAuthToken) {
      return res.redirect('/link/request-link')
    }

    const token = req.session.createBarcodeAuthToken
    return verify(
      token,
      config.barcodeTokenPublicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors, payload: JwtPayload) => {
        if (err) {
          req.flash('errors', [{ text: 'There was an error verifying your email - please try again' }])
          return res.redirect('/link/request-link')
        }
        req.session.barcodeUserEmail = payload.sub
        return next()
      }
    )
  }
}
