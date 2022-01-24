import { Request, Response } from 'express'
import type { CreateNewContactForm } from 'forms'
import { Prison, PrisonAddress, Recipient } from '../../../@types/prisonTypes'
import validateNewContact from './newContactValidator'
import config from '../../../config'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import CreateContactView from './CreateContactView'

export default class CreateContactController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getCreateNewContactByPrisonNumberView(req: Request, res: Response): Promise<void> {
    if (!req.session.findRecipientForm) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.createNewContactForm = { ...(req.session.createNewContactForm || {}), ...req.session.findRecipientForm }

    let activePrisons: Array<Prison>
    try {
      activePrisons = this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const view = new CreateContactView(
      req.session.createNewContactForm || {},
      this.filterSupportedPrisons(activePrisons),
      req.flash('errors')
    )
    return res.render('pages/barcode/create-new-contact', { ...view.renderArgs })
  }

  async submitCreateNewContactByPrisonNumber(req: Request, res: Response): Promise<void> {
    if (!req.session.findRecipientForm) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.createNewContactForm = { ...req.session.findRecipientForm, ...req.body }
    const errors = validateNewContact(req.session.createNewContactForm)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }

    // TODO SLM-60 - save new contact to database via API

    const newRecipient = req.session.createNewContactForm
    try {
      const prisonAddress = await this.prisonRegisterService.getPrisonAddress(newRecipient.prisonId)
      this.addRecipient(req, newRecipient, prisonAddress)
      req.session.findRecipientForm = undefined
      req.session.createNewContactForm = undefined
      return res.redirect('/barcode/review-recipients')
    } catch (error) {
      // An error getting the prison address
      req.flash('errors', [
        { href: 'prisonId', text: 'There was a problem getting the address for the selected prison' },
      ])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }
  }

  private filterSupportedPrisons(activePrisons: Array<Prison>): Array<Prison> {
    if (!config.supportedPrisons || config.supportedPrisons === '') {
      return activePrisons
    }

    const supportedPrisons: Array<string> = config.supportedPrisons
      .split(',')
      .map(prisonId => prisonId.trim().toUpperCase())
    return activePrisons.filter(prison => supportedPrisons.includes(prison.id.toUpperCase()))
  }

  private addRecipient(req: Request, newRecipient: CreateNewContactForm, prisonAddress: PrisonAddress) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }

    const recipient: Recipient = {
      prisonNumber: newRecipient.prisonNumber,
      prisonerName: newRecipient.prisonerName,
      prisonAddress,
    }

    req.session.recipients.push(recipient)
  }
}
