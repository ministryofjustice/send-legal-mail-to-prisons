import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import validateNewContact from './newContactByPrisonNumberValidator'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import CreateContactByPrisonNumberView from './CreateContactByPrisonNumberView'
import filterSupportedPrisons from './filterSupportedPrisons'
import ContactService from '../../../services/contacts/ContactService'
import logger from '../../../../logger'
import RecipientFormService from '../recipients/RecipientFormService'

export default class CreateContactByPrisonNumberController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly contactService: ContactService,
    private readonly recipientFormService: RecipientFormService
  ) {}

  async getCreateNewContact(req: Request, res: Response): Promise<void> {
    const redirect = this.recipientFormService.requiresPrisonNumber(req)
    if (redirect) {
      return res.redirect(redirect)
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
    const redirect = this.recipientFormService.requiresPrisonNumber(req)
    if (redirect) {
      return res.redirect(redirect)
    }

    req.session.createNewContactByPrisonNumberForm = { ...req.body }
    const errors = validateNewContact(req.session.createNewContactByPrisonNumberForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }

    const { recipientForm, createNewContactByPrisonNumberForm } = req.session
    recipientForm.prisonerName = createNewContactByPrisonNumberForm.prisonerName
    recipientForm.prisonId = createNewContactByPrisonNumberForm.prisonId
    try {
      const { prisonNumber, prisonId, prisonerName } = recipientForm
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
      await this.recipientFormService.addRecipient(req)
      req.session.createNewContactByPrisonNumberForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      logger.error(`Failed to add recipient ${JSON.stringify(req.session.recipientForm)} due to error:`, error)
      req.flash('errors', [
        { href: 'prisonId', text: 'There was a problem adding your new recipient. Please try again.' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }
  }
}
