import { Request, Response } from 'express'
import MagicLinkService from '../../services/link/MagicLinkService'
import logger from '../../../logger'

export default class VerifyLinkController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

  async verifyLink(req: Request, res: Response): Promise<void> {
    const secret = req.query.secret as string
    if (!secret) {
      logger.debug('No secret on the query string')
      return res.redirect('request-link')
    }

    return this.magicLinkService
      .verifyLink(secret)
      .then(token => {
        req.session.createBarcodeAuthToken = token
        logger.debug('added barcode auth token to session - about to redirect')
        res.redirect('/barcode/find-recipient')
      })
      .catch(() => {
        logger.debug('Unable to return token from API - probably been used before')
        req.flash('errors', [{ text: 'The link you used is no longer valid. Request a new one to log in.' }])
        res.redirect('request-link')
      })
  }
}
