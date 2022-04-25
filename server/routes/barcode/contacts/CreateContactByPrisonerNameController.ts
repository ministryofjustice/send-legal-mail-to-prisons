import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import CreateContactByPrisonerNameView from './CreateContactByPrisonerNameView'
import validateNewContact from './newContactByPrisonerNameValidator'
import filterSupportedPrisons from './filterSupportedPrisons'
import ContactService from '../../../services/contacts/ContactService'
import logger from '../../../../logger'
import RecipientFormService from '../recipients/RecipientFormService'
import parseDob from './parseDob'

export default class CreateContactByPrisonerNameController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly contactService: ContactService,
    private readonly recipientFormService: RecipientFormService
  ) {}

  async getCreateNewContact(req: Request, res: Response): Promise<void> {
    const redirect = this.recipientFormService.requiresName(req)
    if (redirect) {
      return res.redirect(redirect)
    }

    let activePrisons: Array<Prison>
    try {
      activePrisons = await this.prisonRegisterService.getActivePrisonsFromPrisonRegister()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const createNewContactByPrisonerNameForm = {
      ...(req.session.createNewContactByPrisonerNameForm || {}),
      prisonerName: req.session.recipientForm.prisonerName,
    }
    const view = new CreateContactByPrisonerNameView(
      createNewContactByPrisonerNameForm,
      filterSupportedPrisons(activePrisons),
      req.flash('errors')
    )
    return res.render('pages/barcode/create-new-contact-by-prisoner-name', { ...view.renderArgs })
  }

  async submitCreateNewContact(req: Request, res: Response): Promise<void> {
    const redirect = this.recipientFormService.requiresName(req)
    if (redirect) {
      return res.redirect(redirect)
    }

    const prisonerDob = parseDob(req, 'prisonerDob')
    req.session.createNewContactByPrisonerNameForm = { ...req.body, prisonerDob }
    const errors = validateNewContact(req.session.createNewContactByPrisonerNameForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }

    const { recipientForm, createNewContactByPrisonerNameForm } = req.session
    recipientForm.prisonerDob = createNewContactByPrisonerNameForm.prisonerDob
    recipientForm.prisonId = createNewContactByPrisonerNameForm.prisonId
    try {
      const { prisonerName, prisonId, prisonNumber } = req.session.recipientForm
      const contact = await this.contactService.createContact(
        req.session.barcodeUser.token,
        req.ip,
        prisonerName,
        prisonId,
        prisonNumber,
        prisonerDob
      )
      recipientForm.contactId = contact.id
    } catch (error) {
      logger.error(
        `Failed to save new contact from form ${JSON.stringify(
          req.session.createNewContactByPrisonerNameForm
        )} due to error:`,
        error
      )
    }

    try {
      await this.recipientFormService.addRecipient(req)
      req.session.createNewContactByPrisonerNameForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      logger.error(`Failed to add recipient ${JSON.stringify(req.session.recipientForm)} due to error:`, error)
      req.flash('errors', [
        { href: '#prisonId', text: 'There was a problem adding your new recipient. Please try again.' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }
  }
}
