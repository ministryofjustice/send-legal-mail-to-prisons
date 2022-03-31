import { RequestHandler } from 'express'

export default function requestLinkAuthorised(): RequestHandler {
  return (req, res, next) => {
    if (!req.originalUrl.startsWith('/link/request-link')) {
      return next()
    }
    if (req.originalUrl === '/link/request-link?force=true') {
      req.session.barcodeUser = { tokenValid: false }
    }
    if (req.session.barcodeUser?.tokenValid) {
      return res.redirect('/barcode/find-recipient')
    }
    return next()
  }
}
