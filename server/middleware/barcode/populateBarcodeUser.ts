import { RequestHandler } from 'express'
import CjsmService from '../../services/cjsm/CjsmService'

export default function populateBarcodeUser(cjsmService: CjsmService): RequestHandler {
  return async (req, res, next) => {
    res.locals.barcodeUser = { email: req.session.barcodeUser.email }
    if (req.session.barcodeUser.email && !req.session.barcodeUser.cjsmDetails) {
      req.session.barcodeUser.cjsmDetails = await cjsmService
        .getUserDetails(req.session.barcodeUser.token)
        .catch(error => {
          if (error.status === 404) {
            return { userId: req.session.barcodeUser.email }
          }
          throw error
        })
    }
    next()
  }
}
