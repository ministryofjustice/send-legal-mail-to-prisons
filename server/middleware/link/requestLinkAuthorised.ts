import { RequestHandler } from 'express'

export default function requestLinkAuthorised(): RequestHandler {
  return (req, res, next) => {
    if (!req.originalUrl.startsWith('/link/request-link')) {
      return next()
    }
    if (req.originalUrl === '/link/request-link?force=true') {
      req.session.validCreateBarcodeAuthToken = false
    }
    if (req.session.validCreateBarcodeAuthToken) {
      return res.redirect('/barcode/find-recipient')
    }
    return next()
  }
}
