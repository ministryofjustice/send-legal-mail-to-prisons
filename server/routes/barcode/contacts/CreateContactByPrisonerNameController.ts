import { Request, Response } from 'express'
import type { CreateNewContactByPrisonerNameForm } from 'forms'
import moment from 'moment'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import { Prison, PrisonAddress, Recipient } from '../../../@types/prisonTypes'
import CreateContactByPrisonerNameView from './CreateContactByPrisonerNameView'
import validateNewContact from './newContactByPrisonerNameValidator'
import filterSupportedPrisons from './filterSupportedPrisons'

export default class CreateContactByPrisonerNameController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getCreateNewContact(req: Request, res: Response): Promise<void> {
    // TODO SLM-109 check the prisoner on the form exists! Otherwise user can enter on empty prisoner name to create the form then type this URL into the browser
    if (!req.session.findRecipientByPrisonerNameForm) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.createNewContactByPrisonerNameForm = {
      ...(req.session.createNewContactByPrisonerNameForm || { prisonerName: '' }),
      ...req.session.findRecipientByPrisonerNameForm,
    }

    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const view = new CreateContactByPrisonerNameView(
      req.session.createNewContactByPrisonerNameForm || { prisonerName: '' },
      filterSupportedPrisons(activePrisons),
      req.flash('errors')
    )
    return res.render('pages/barcode/create-new-contact-by-prisoner-name', { ...view.renderArgs })
  }

  async submitCreateNewContact(req: Request, res: Response): Promise<void> {
    if (!req.session.findRecipientByPrisonerNameForm) {
      return res.redirect('/barcode/find-recipient')
    }

    const prisonerDob = this.parsePrisonerDob(req)
    req.session.createNewContactByPrisonerNameForm = {
      ...req.session.findRecipientByPrisonerNameForm,
      ...req.body,
      prisonerDob,
    }
    const errors = validateNewContact(req.session.createNewContactByPrisonerNameForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }

    // TODO SLM-60 - save new contact to database via API

    const newRecipient = req.session.createNewContactByPrisonerNameForm
    try {
      const prisonAddress = await this.prisonRegisterService.getPrisonAddress(newRecipient.prisonId)
      this.addRecipient(req, newRecipient, prisonAddress)
      req.session.findRecipientByPrisonerNameForm = undefined
      req.session.createNewContactByPrisonerNameForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      // An error getting the prison address
      req.flash('errors', [
        { href: 'prisonId', text: 'There was a problem getting the address for the selected prison' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }
  }

  private addRecipient(req: Request, newRecipient: CreateNewContactByPrisonerNameForm, prisonAddress: PrisonAddress) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }

    const recipient: Recipient = {
      prisonerName: newRecipient.prisonerName,
      prisonerDob: newRecipient.prisonerDob,
      prisonAddress,
    }

    req.session.recipients.push(recipient)
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
