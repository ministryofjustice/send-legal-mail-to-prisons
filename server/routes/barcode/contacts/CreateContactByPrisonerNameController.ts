import { Request, Response } from 'express'
import moment from 'moment'
import type { Prison, Recipient } from 'prisonTypes'
import type { RecipientForm } from 'forms'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import CreateContactByPrisonerNameView from './CreateContactByPrisonerNameView'
import validateNewContact from './newContactByPrisonerNameValidator'
import filterSupportedPrisons from './filterSupportedPrisons'
import ContactService from '../../../services/contacts/ContactService'
import logger from '../../../../logger'

export default class CreateContactByPrisonerNameController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly contactService: ContactService
  ) {}

  async getCreateNewContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonerName?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const view = new CreateContactByPrisonerNameView(
      req.session.createNewContactByPrisonerNameForm || {},
      filterSupportedPrisons(activePrisons),
      req.flash('errors')
    )
    return res.render('pages/barcode/create-new-contact-by-prisoner-name', { ...view.renderArgs })
  }

  async submitCreateNewContact(req: Request, res: Response): Promise<void> {
    if ((req.session.recipientForm?.prisonerName?.trim() ?? '') === '') {
      return res.redirect('/barcode/find-recipient')
    }

    const prisonerDob = this.parsePrisonerDob(req)
    req.session.createNewContactByPrisonerNameForm = { ...req.body, prisonerDob }
    const errors = validateNewContact(req.session.createNewContactByPrisonerNameForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }

    req.session.recipientForm.prisonerDob = req.session.createNewContactByPrisonerNameForm.prisonerDob
    req.session.recipientForm.prisonId = req.session.createNewContactByPrisonerNameForm.prisonId
    try {
      const { prisonerName, prisonId, prisonNumber } = req.session.recipientForm
      await this.contactService.createContact(req.session.slmToken, prisonerName, prisonId, prisonNumber, prisonerDob)
    } catch (error) {
      logger.error(
        `Failed to save new contact from form ${JSON.stringify(
          req.session.createNewContactByPrisonerNameForm
        )} due to error:`,
        error
      )
    }

    try {
      req.session.recipientForm.prisonAddress = await this.prisonRegisterService.getPrisonAddress(
        req.session.recipientForm.prisonId
      )
      this.addRecipient(req, req.session.recipientForm)
      req.session.createNewContactByPrisonerNameForm = undefined
      req.session.recipientForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      req.flash('errors', [
        { href: 'prisonId', text: 'There was a problem getting the address for the selected prison' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
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

  parsePrisonerDob(req: Request): Date | undefined {
    const dobDay: string = req.body['prisonerDob-day'] ? (req.body['prisonerDob-day'] as string).padStart(2, '0') : ''
    const dobMonth: string = req.body['prisonerDob-month']
      ? (req.body['prisonerDob-month'] as string).padStart(2, '0')
      : ''
    const dobYear: string = req.body['prisonerDob-year'] ? (req.body['prisonerDob-year'] as string) : ''
    if (dobDay === '' && dobMonth === '' && dobYear === '') {
      return undefined
    }
    return moment(`${dobDay}-${dobMonth}-${dobYear}`, 'DD-MM-YYYY', true).toDate()
  }
}
