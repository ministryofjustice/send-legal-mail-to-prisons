import { Request, Response } from 'express'
import moment from 'moment'
import type { Recipient } from 'prisonTypes'
import type { Contact } from 'sendLegalMailApiClient'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import ContactService from '../../../services/contacts/ContactService'
import ChooseContactView from './ChooseContactView'

export default class ChooseContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly prisonRegisterService: PrisonRegisterService
  ) {}

  async getChooseContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonerName?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    if ((req.session.recipientForm?.contacts ?? []).length === 0) {
      res.redirect('/barcode/find-recipient/by-prisoner-name')
    }

    const { searchName, contacts } = req.session.recipientForm
    const view = new ChooseContactView(req.session.chooseContactForm || {}, searchName, contacts, req.flash('errors'))
    return res.render('pages/barcode/choose-contact', { ...view.renderArgs })
  }

  async submitChooseContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonerName?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    if ((req.session.recipientForm?.contacts ?? []).length === 0) {
      res.redirect('/barcode/find-recipient/by-prisoner-name')
    }

    const contactId = req.session.chooseContactForm?.contactId || ''
    if (!contactId) {
      req.flash('errors', [{ href: '#contactOption', text: 'Select an option' }])
      return res.redirect('/barcode/find-recipient/choose-contact')
    }

    if (contactId > 0) {
      const contact = this.findContact(req, contactId)
      try {
        const prisonAddress = await this.prisonRegisterService.getPrisonAddress(contact.prisonId)
        const newRecipient: Recipient = {
          prisonNumber: contact.prisonNumber,
          prisonerName: contact.prisonerName,
          prisonerDob: moment(contact.dob, 'YYY-MM-DD').toDate(),
          prisonAddress,
        }
        this.addRecipient(req, newRecipient)
        req.session.chooseContactForm = undefined
        req.session.recipientForm = undefined
        return res.redirect('/barcode/review-recipients')
      } catch (error) {
        req.flash('errors', [
          { text: 'There was a problem getting the address for the selected prison. Please try again.' },
        ])
        return res.redirect('/barcode/find-recipient/choose-contact')
      }
    }

    // The user must have selected to create a new contact
    req.session.chooseContactForm = undefined
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
  }

  private findContact(req: Request, contactId: string): Contact | undefined {
    return req.session.contactSearchResults.find((contact: Contact) => contact.id.toString() === contactId)
  }

  private addRecipient(req: Request, newRecipient: Recipient) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }

    req.session.recipients.push(newRecipient)
  }
}
