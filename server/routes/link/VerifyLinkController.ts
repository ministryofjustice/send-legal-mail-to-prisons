import { Request, Response } from 'express'
import { JwtPayload, verify, VerifyErrors } from 'jsonwebtoken'
import MagicLinkService from '../../services/link/MagicLinkService'
import config from '../../config'

export default class VerifyLinkController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

  async verifyLink(req: Request, res: Response): Promise<void> {
    const secret = req.query.secret as string
    if (!secret) {
      return res.redirect('request-link')
    }

    req.session.barcodeUser = { tokenValid: false, token: undefined }

    return this.magicLinkService
      .verifyLink(secret, req.ip)
      .then(token => {
        req.session.barcodeUser.token = token
        this.verifyToken(token, req, res)
      })
      .catch(() => {
        req.flash('errors', [
          { href: '#email', text: 'The link you used is no longer valid. Request a new one to sign in.' },
        ])
        res.redirect('request-link')
      })
  }

  private verifyToken(token: string, req: Request, res: Response) {
    verify(token, config.barcodeTokenPublicKey, { algorithms: ['RS256'] }, (err: VerifyErrors, payload: JwtPayload) => {
      if (err) {
        req.flash('errors', [
          { href: '#email', text: 'The link you used is no longer valid. Request a new one to sign in.' },
        ])
        return res.redirect('/link/request-link')
      }

      req.session.barcodeUser.email = payload.sub
      req.session.barcodeUser.token = token
      req.session.barcodeUser.tokenValid = true
      // make the session expiry the same as the JWT - otherwise we lose the JWT when the session expires
      req.session.cookie.expires = new Date(payload.exp * 1000)
      const { id, ...sessionWithoutId } = req.session
      req.session.regenerate(() => {
        // put the old session back - but keep the new session ID
        Object.assign(req.session, sessionWithoutId)
      })
      return res.redirect('/barcode/find-recipient')
    })
  }
}
