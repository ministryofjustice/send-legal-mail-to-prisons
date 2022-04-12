import { Request, Response } from 'express'
import OneTimeCodeEmailSentView from './OneTimeCodeEmailSentView'

export default class OneTimeCodeEmailSentController {
  async getOneTimeCodeEmailSentView(req: Request, res: Response): Promise<void> {
    if (!req.session.requestOneTimeCodeForm?.email) {
      return res.redirect('request-code')
    }

    const view = new OneTimeCodeEmailSentView(req.session.requestOneTimeCodeForm.email, req.flash('errors'))
    return res.render('pages/one-time-code-auth/emailSent', { ...view.renderArgs })
  }
}
