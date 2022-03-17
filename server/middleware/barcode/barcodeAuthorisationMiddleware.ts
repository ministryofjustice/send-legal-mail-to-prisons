import { RequestHandler } from 'express'
import type { VerifyErrors } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import createError from 'http-errors'
import config from '../../config'
import logger from '../../../logger'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.barcodeUser = undefined

    if (!req.session.slmToken || !req.session.validSlmToken) {
      return res.redirect('/link/request-link')
    }

    return verify(
      req.session.slmToken,
      config.barcodeTokenPublicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors) => {
        if (err) {
          const errorMessage = `Found an invalid JWT: ${req.session.slmToken} which caused error: ${err}`
          logger.warn(errorMessage)
          req.session.validSlmToken = false
          req.session.slmToken = undefined
          return next(
            createError(401, 'invalid JWT', {
              code: 'EBADJWT',
            })
          )
        }
        return next()
      }
    )
  }
}
