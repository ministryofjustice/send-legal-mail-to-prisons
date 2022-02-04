import { Request, Response } from 'express'

export default class ContactHelpdeskController {
  async getContactHelpdeskView(req: Request, res: Response): Promise<void> {
    res.render('pages/helpdesk/contact-helpdesk', {})
  }
}
