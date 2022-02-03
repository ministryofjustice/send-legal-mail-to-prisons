import { Request, Response } from 'express'
import type { Prison, Recipient } from 'prisonTypes'
import type { RecipientForm } from 'forms'
import validateNewContact from './newContactByPrisonNumberValidator'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import CreateContactByPrisonNumberView from './CreateContactByPrisonNumberView'
import filterSupportedPrisons from './filterSupportedPrisons'
import ContactService from '../../../services/contacts/ContactService'
import logger from '../../../../logger'

export default class CreateContactByPrisonNumberController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly contactService: ContactService
  ) {}

  async getCreateNewContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonNumber?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const view = new CreateContactByPrisonNumberView(
      req.session.createNewContactByPrisonNumberForm || {},
      filterSupportedPrisons(activePrisons),
      req.flash('errors')
    )
    return res.render('pages/barcode/create-new-contact-by-prison-number', { ...view.renderArgs })
  }

  async submitCreateNewContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonNumber?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.createNewContactByPrisonNumberForm = { ...req.body }
    const errors = validateNewContact(req.session.createNewContactByPrisonNumberForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }

    req.session.recipientForm.prisonerName = req.session.createNewContactByPrisonNumberForm.prisonerName
    req.session.recipientForm.prisonId = req.session.createNewContactByPrisonNumberForm.prisonId
    try {
      const { prisonNumber, prisonerName, prisonId } = req.session.recipientForm
      await this.contactService.createContact(req.session.slmToken, prisonerName, prisonId, prisonNumber)
    } catch (error) {
      logger.error(
        `Failed to save new contact from form ${JSON.stringify(
          req.session.createNewContactByPrisonNumberForm
        )} due to error:`,
        error
      )
    }

    try {
      req.session.recipientForm.prisonAddress = await this.prisonRegisterService.getPrisonAddress(
        req.session.recipientForm.prisonId
      )
      this.addRecipient(req, req.session.recipientForm)
      req.session.createNewContactByPrisonNumberForm = undefined
      req.session.recipientForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      // An error getting the prison address
      req.flash('errors', [
        { href: 'prisonId', text: 'There was a problem getting the address for the selected prison' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }
  }

  private addRecipient(req: Request, recipientForm: RecipientForm) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }

    const newRecipient: Recipient = {
      prisonerName: recipientForm.prisonerName || '',
      prisonNumber: recipientForm.prisonNumber,
      prisonerDob: recipientForm.prisonerDob,
      prisonAddress: recipientForm.prisonAddress,
    }

    req.session.recipients.push(newRecipient)
  }
}
