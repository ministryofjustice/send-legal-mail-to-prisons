import { RequestHandler } from 'express'

export default function requestOneTimeCodeAuthorised(): RequestHandler {
  return (req, res, next) => {
    if (req.originalUrl === '/oneTimeCode/request-code?force=true') {
      req.session.barcodeUser = { tokenValid: false }
    }
    if (req.session.barcodeUser?.tokenValid) {
      return res.redirect('/barcode/find-recipient')
    }
    return next()
  }
}
