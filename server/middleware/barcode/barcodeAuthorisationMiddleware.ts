import { RequestHandler } from 'express'
import type { VerifyErrors, JwtPayload } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import config from '../../config'
import logger from '../../../logger'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.barcodeUser = undefined

    if (!req.session.createBarcodeAuthToken) {
      logger.debug('Barcode auth token is not in the session')
      return res.redirect('/link/request-link')
    }

    const token = req.session.createBarcodeAuthToken
    return verify(
      token,
      config.barcodeTokenPublicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors, payload: JwtPayload) => {
        if (err) {
          logger.debug('Could not verify the sig of the Barcode auth token')
          req.flash('errors', [{ text: 'The link you used is no longer valid. Request a new one to log in.' }])
          return res.redirect('/link/request-link')
        }
        req.session.barcodeUserEmail = payload.sub
        return next()
      }
    )
  }
}
