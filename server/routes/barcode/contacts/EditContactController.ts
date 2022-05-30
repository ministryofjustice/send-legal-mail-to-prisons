import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import moment from 'moment'
import type { Contact } from 'sendLegalMailApiClient'
import type { EditContactForm } from 'forms'
import EditContactView from './EditContactView'
import logger from '../../../../logger'
import ContactService from '../../../services/contacts/ContactService'
import parseDob from './parseDob'
import validateContact from './updateContactValidator'
import RecipientFormService from '../recipients/RecipientFormService'
import PrisonService from '../../../services/prison/PrisonService'

export default class EditContactController {
  constructor(
    private readonly prisonService: PrisonService,
    private readonly contactService: ContactService,
    private readonly recipientService: RecipientFormService
  ) {}

  async getEditContact(req: Request, res: Response): Promise<void> {
    const contactId = Number(req.params.contactId ? req.params.contactId : undefined)
    if (Number.isNaN(contactId)) {
      logger.error(`Unable to edit contact with id ${req.params.contactId}`)
      req.flash('errors', [{ text: 'The contact does not exist' }])
      return res.redirect('/barcode/review-recipients')
    }

    let supportedPrisons: Array<Prison>
    try {
      supportedPrisons = await this.prisonService.getSupportedPrisons()
    } catch (error) {
      logger.error(`Unable to load prisons due to error`, error)
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      return res.redirect('/barcode/review-recipients')
    }

    let editContactForm: EditContactForm
    // Edit the existing contact
    if (Number(req.session.editContactForm?.contactId) === contactId) {
      const dob = parseDob(req, 'dob')
      editContactForm = { ...req.session.editContactForm, dob }
    }
    // Load a new contact to edit
    else {
      let contact: Contact
      try {
        contact = await this.contactService.getContactById(req.session.barcodeUser.token, req.ip, contactId)
      } catch (error) {
        logger.error(`Unable to load contact with id ${contactId} due to error:`, error)
        req.flash('errors', [{ text: 'We were unable to find the contact' }])
        return res.redirect('/barcode/review-recipients')
      }
      const dob = moment(contact.dob, 'YYYY-MM-DD')
      editContactForm = {
        contactId,
        prisonerName: contact.prisonerName,
        prisonId: contact.prisonId,
        prisonNumber: contact.prisonNumber,
        dob: dob.isValid() ? dob.toDate() : undefined,
        'dob-day': dob.isValid() ? dob.date().toString() : '',
        'dob-month': dob.isValid() ? (dob.month() + 1).toString() : '',
        'dob-year': dob.isValid() ? dob.year().toString() : '',
      }
    }

    const view = new EditContactView(editContactForm, supportedPrisons, req.flash('errors'))

    return res.render('pages/barcode/edit-contact-details', { ...view.renderArgs })
  }

  async submitUpdateContact(req: Request, res: Response): Promise<void> {
    const dob = parseDob(req, 'dob')
    req.session.editContactForm = { ...req.body, dob }

    const errors = validateContact(req.session.editContactForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect(`/barcode/edit-contact/${req.session.editContactForm.contactId}`)
    }

    let updatedContact
    try {
      const { contactId, prisonerName, prisonNumber, prisonId } = req.session.editContactForm
      updatedContact = await this.contactService.updateContact(
        req.session.barcodeUser.token,
        req.ip,
        prisonerName,
        prisonId,
        contactId,
        prisonNumber || undefined,
        dob
      )
      await this.recipientService.updateContact(req, updatedContact)
      req.session.editContactForm = undefined
    } catch (error) {
      // There is currently only one field that can conflict - prisonNumber
      if (error.status === 409) {
        req.flash('errors', [{ href: '#prisonNumber', text: error.data.errorCode.userMessage }])
        return res.redirect(`/barcode/edit-contact/${req.session.editContactForm.contactId}`)
      }
      logger.error(`Unable to save contact ${JSON.stringify(req.session.editContactForm)} due to error`, error)
      req.flash('errors', [{ text: 'There was an error updating the contact' }])
    }

    return res.redirect('/barcode/review-recipients')
  }
}
