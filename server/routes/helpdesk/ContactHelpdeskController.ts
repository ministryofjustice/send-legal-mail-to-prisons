import fs from 'fs'
import { Request, Response } from 'express'
import type { ContactHelpdeskForm } from 'forms'
import ContactHelpdeskView from './ContactHelpdeskView'
import validate from './contactHelpdeskFormValidator'
import logger from '../../../logger'
import ZendeskService from '../../services/helpdesk/ZendeskService'

export default class ContactHelpdeskController {
  constructor(private readonly zendeskService: ZendeskService) {}

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
    const errors = validate(req.session.contactHelpdeskForm, req.file)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Redirect to original url inc. query string because Legal Sender and Mail Room journeys have different urls, so can't hardcode a redirect url here
      return res.redirect(req.originalUrl)
    }

    const { externalUser } = res.locals
    const username = externalUser ? req.session.barcodeUser?.email : res.locals.user.username
    const organisation = externalUser ? req.session.barcodeUser?.cjsmDetails.organisation : null

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const zendeskTicketId = await this.zendeskService.createSupportTicket(
        req.session.contactHelpdeskForm,
        externalUser,
        username,
        organisation
      )
    } catch (e) {
      req.flash('errors', [{ text: 'There was a problem sending your message to the Helpdesk.' }])
      // Redirect to original url inc. query string because Legal Sender and Mail Room journeys have different urls, so can't hardcode a redirect url here
      return res.redirect(req.originalUrl)
    } finally {
      // Uploaded file properties are available in req.file; remember to delete req.file.path
      if (req.file) {
        logger.info(`Uploaded file: ${JSON.stringify(req.file)}`)
        fs.unlinkSync(req.file.path)
      }
    }

    req.session.contactHelpdeskForm = undefined
    // Use request baseUrl as the basis for the redirect because Legal Sender and Mail Room journeys have different urls, so can't hardcode a redirect url here
    return res.redirect(`${req.baseUrl}/submitted`)
  }

  async getContactHelpdeskSubmittedView(req: Request, res: Response): Promise<void> {
    res.render('pages/helpdesk/submitted', {})
  }
}
