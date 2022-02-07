import { Request, Response } from 'express'
import type { ContactHelpdeskForm } from 'forms'
import ContactHelpdeskView from './ContactHelpdeskView'
import validate from './contactHelpdeskFormValidator'

export default class ContactHelpdeskController {
  async getContactHelpdeskView(req: Request, res: Response): Promise<void> {
    const form: ContactHelpdeskForm = {
      ...(req.session?.contactHelpdeskForm || {}),
      pageId: req.query.pageId ?? 'unknown',
    }
    const view = new ContactHelpdeskView(form, req.flash('errors'))
    res.render('pages/helpdesk/contact-helpdesk', { ...view.renderArgs })
  }

  async submitContactHelpdesk(req: Request, res: Response): Promise<void> {
    req.session.contactHelpdeskForm = { ...req.body }
    const errors = validate(req.session.contactHelpdeskForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Redirect to original url inc. query string because Legal Sender and Mail Room journeys have different urls, so can't hardcode a redirect url here
      return res.redirect(req.originalUrl)
    }

    // TODO - SLM-126 - call service to send data to zendesk

    req.session.contactHelpdeskForm = undefined
    // Use request baseUrl as the basis for the redirect because Legal Sender and Mail Room journeys have different urls, so can't hardcode a redirect url here
    return res.redirect(`${req.baseUrl}/submitted`)
  }

  async getContactHelpdeskSubmittedView(req: Request, res: Response): Promise<void> {
    res.render('pages/helpdesk/submitted', {})
  }
}
