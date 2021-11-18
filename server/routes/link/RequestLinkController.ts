import { Request, Response } from 'express'
import RequestLinkView from './RequestLinkView'
import validate from './RequestLinkValidator'

export default class RequestLinkController {
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

    const emailSentTo = req.session.requestLinkForm.email
    delete req.session.requestLinkForm

    const view = new RequestLinkView({}, [])
    return res.render('pages/link/emailSent', { ...view.renderArgs, emailSentTo })
  }
}
