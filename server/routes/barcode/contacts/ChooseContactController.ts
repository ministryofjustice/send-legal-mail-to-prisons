import { Request, Response } from 'express'
import type { Contact } from 'sendLegalMailApiClient'
import ChooseContactView from './ChooseContactView'
import RecipientFormService from '../recipients/RecipientFormService'

export default class ChooseContactController {
  constructor(private readonly recipientFormService: RecipientFormService) {}

  async getChooseContact(req: Request, res: Response): Promise<void> {
    const redirect = this.recipientFormService.requiresName(req) || this.recipientFormService.requiresContacts(req)
    if (redirect) {
      return res.redirect(redirect)
    }

    const { searchName, contacts } = req.session.recipientForm
    const view = new ChooseContactView(req.session.chooseContactForm || {}, searchName, contacts, req.flash('errors'))
    return res.render('pages/barcode/choose-contact', { ...view.renderArgs })
  }

  async submitChooseContact(req: Request, res: Response): Promise<void> {
    const redirect = this.recipientFormService.requiresName(req) || this.recipientFormService.requiresContacts(req)
    if (redirect) {
      return res.redirect(redirect)
    }

    req.session.chooseContactForm = { ...req.body }
    const contactId = +(req.session.chooseContactForm?.contactId || 0)
    if (!contactId) {
      req.flash('errors', [{ href: '#contactOption', text: 'Select an option' }])
      return res.redirect('/barcode/find-recipient/choose-contact')
    }

    if (contactId > 0) {
      try {
        const contact = this.findContact(req, contactId)
        await this.recipientFormService.addContact(req, contact)
        req.session.chooseContactForm = undefined
        return res.redirect('/barcode/review-recipients')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        req.flash('errors', [{ text: 'There was a problem adding your contact. Please try again.' }])
        return res.redirect('/barcode/find-recipient/choose-contact')
      }
    }

    // The user must have selected to create a new contact
    req.session.chooseContactForm = undefined
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
  }

  private findContact(req: Request, contactId: number): Contact | undefined {
    return req.session.recipientForm.contacts.find((contact: Contact) => contact.id === contactId)
  }
}
