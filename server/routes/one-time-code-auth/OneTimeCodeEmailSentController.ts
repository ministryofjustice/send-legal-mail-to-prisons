import { Request, Response } from 'express'

export default class OneTimeCodeEmailSentController {
  async getOneTimeCodeEmailSentView(req: Request, res: Response): Promise<void> {
    if (!req.session.requestOneTimeCodeForm?.email) {
      return res.redirect('request-code')
    }

    const emailSentTo = req.session.requestOneTimeCodeForm.email
    return res.render('pages/one-time-code-auth/emailSent', { emailSentTo })
  }
}
