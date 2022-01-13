import { Request, Response } from 'express'
import { Prison } from '../../@types/prisonTypes'
import validateNewContact from './newContactValidator'
import config from '../../config'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import CreateContactView from './CreateContactView'

export default class CreateContactController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getCreateNewContactView(req: Request, res: Response): Promise<void> {
    if (!req.session.findRecipientForm) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.createNewContactForm = { ...(req.session.createNewContactForm || {}), ...req.session.findRecipientForm }

    let activePrisons: Array<Prison>
    try {
      activePrisons = await this.prisonRegisterService.getActivePrisons()
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

  async submitCreateNewContact(req: Request, res: Response): Promise<void> {
    if (!req.session.findRecipientForm) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.findRecipientForm = { ...req.session.findRecipientForm, ...req.body }
    if (!validateNewContact(req)) {
      return res.redirect('/barcode/find-recipient/create-new-contact')
    }

    return res.redirect('/barcode/review-recipients')
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
}
