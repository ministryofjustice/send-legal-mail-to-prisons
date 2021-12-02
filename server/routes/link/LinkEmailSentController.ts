import { Request, Response } from 'express'

export default class LinkEmailSentController {
  async getLinkEmailSentView(req: Request, res: Response): Promise<void> {
    if (!req.session.requestLinkForm?.email) {
      return res.redirect('request-link')
    }

    const emailSentTo = req.session.requestLinkForm.email
    return res.render('pages/link/emailSent', { emailSentTo })
  }
}
