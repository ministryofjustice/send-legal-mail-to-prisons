import { RequestHandler } from 'express'

export default function barcodeAuthorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.barcodeUser = undefined

    if (!req.session.slmToken || !req.session.validSlmToken) {
      return res.redirect('/link/request-link')
    }

    return next()
  }
}
