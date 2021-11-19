import { Request, Response } from 'express'
import RequestLinkView from './RequestLinkView'
import validate from './RequestLinkValidator'
import MagicLinkService from '../../services/link/MagicLinkService'

export default class RequestLinkController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

  async getRequestLinkView(req: Request, res: Response): Promise<void> {
    const view = new RequestLinkView(req.session?.requestLinkForm || {}, req.flash('errors'))

    res.clearCookie('create_barcode_token')
    return res.render('pages/link/requestLink', { ...view.renderArgs })
  }

  async submitLinkRequest(req: Request, res: Response): Promise<void> {
    req.session.requestLinkForm = { ...req.body }
    if (!validate(req.session.requestLinkForm, req)) {
      return res.redirect('request-link')
    }

    return this.magicLinkService
      .requestLink(req.session.requestLinkForm.email, req.sessionID)
      .then(() => {
        const emailSentTo = req.session.requestLinkForm.email
        delete req.session.requestLinkForm

        const view = new RequestLinkView({}, [])
        return res.render('pages/link/emailSent', { ...view.renderArgs, emailSentTo })
      })
      .catch(() => {
        req.flash('errors', [{ text: 'There was an error generating your sign in link' }])
        return res.redirect('request-link')
      })
  }
}
