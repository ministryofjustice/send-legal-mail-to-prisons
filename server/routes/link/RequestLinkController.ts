import { Request, Response } from 'express'
import RequestLinkView from './RequestLinkView'

export default class RequestLinkController {
  async getRequestLinkView(req: Request, res: Response) {
    const view = new RequestLinkView(req.session?.requestLinkForm || {}, req.flash('errors'))

    res.clearCookie('create_barcode_token').render('pages/link/requestLink', view.renderArgs)
  }
}
