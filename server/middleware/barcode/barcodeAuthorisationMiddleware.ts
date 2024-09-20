import { RequestHandler } from 'express'
import type { VerifyErrors } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import createError from 'http-errors'
import config from '../../config'
import logger from '../../../logger'
import legalSenderJourneyAuthenticationStartPage from '../legalSenderJourneyAuthenticationStartPage'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    console.log(req.session)
    if (!req.session.barcodeUser?.token || !req.session.barcodeUser?.tokenValid) {
      return res.redirect(legalSenderJourneyAuthenticationStartPage())
    }

    return verify(
      req.session.barcodeUser.token,
      config.barcodeTokenPublicKey,
      { algorithms: ['RS256'] },
      (err: VerifyErrors) => {
        if (err) {
          const errorMessage = `Found an invalid JWT: ${req.session.barcodeUser.token} which caused error: ${err}`
          logger.warn(errorMessage)
          req.session.barcodeUser.token = undefined
          req.session.barcodeUser.tokenValid = false
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
