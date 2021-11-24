import { RequestHandler } from 'express'

export default function populateBarcodeUser(): RequestHandler {
  return async (req, res, next) => {
    res.locals.barcodeUser = undefined
    if (req.session.barcodeUserEmail) {
      res.locals.barcodeUser = { email: req.session.barcodeUserEmail }
    }
    next()
  }
}
