import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import moment from 'moment'
import type { Contact } from 'sendLegalMailApiClient'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import EditContactView from './EditContactView'
import logger from '../../../../logger'
import ContactService from '../../../services/contacts/ContactService'
import filterSupportedPrisons from './filterSupportedPrisons'

export default class EditContactController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly contactService: ContactService
  ) {}

  async getEditContact(req: Request, res: Response): Promise<void> {
    const contactId = Number(req.params.contactId ? req.params.contactId : undefined)
    if (Number.isNaN(contactId)) {
      logger.error(`Unable to edit contact with id ${req.params.contactId}`)
      req.flash('errors', [{ text: 'The contact does not exist' }])
      return res.redirect('/barcode/review-recipients')
    }

    let contact: Contact
    try {
      contact = await this.contactService.getContactById(req.session.slmToken, contactId)
    } catch (error) {
      logger.error(`Unable to load contact with id ${contactId} due to error:`, error)
      req.flash('errors', [{ text: 'We were unable to find the contact' }])
      return res.redirect('/barcode/review-recipients')
    }

    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      return res.redirect('/barcode/review-recipients')
    }

    const dob = moment(contact.dob, 'YYYY-MM-DD')
    const editContactForm = {
      id: contactId,
      name: contact.prisonerName,
      prisonId: contact.prisonId,
      prisonNumber: contact.prisonNumber,
      dob: dob.isValid() ? dob.toDate() : undefined,
      'dob-day': dob.isValid() ? dob.date().toString() : '',
      'dob-month': dob.isValid() ? (dob.month() + 1).toString() : '',
      'dob-year': dob.isValid() ? dob.year().toString() : '',
    }

    const view = new EditContactView(editContactForm, filterSupportedPrisons(activePrisons), req.flash('errors'))

    return res.render('pages/barcode/edit-contact-details', { ...view.renderArgs })
  }
}
