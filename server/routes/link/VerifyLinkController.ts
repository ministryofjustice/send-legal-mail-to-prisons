import { Request, Response } from 'express'
import MagicLinkService from '../../services/link/MagicLinkService'

export default class VerifyLinkController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

  async verifyLink(req: Request, res: Response): Promise<void> {
    const secret = req.query.secret as string
    if (!secret) {
      return res.redirect('request-link')
    }

    return this.magicLinkService
      .verifyLink(secret)
      .then(token => {
        req.session.createBarcodeAuthToken = token
        return res.redirect('/barcode/find-recipient')
      })
      .catch(() => {
        req.flash('errors', [{ text: 'There was an error verifying your email - please try again' }])
        return res.redirect('request-link')
      })
  }
}
