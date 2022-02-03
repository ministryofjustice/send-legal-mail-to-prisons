import { Request, Response } from 'express'
import FindRecipientByPrisonNumberView from './FindRecipientByPrisonNumberView'
import FindRecipientByPrisonerNameView from './FindRecipientByPrisonerNameView'
import validatePrisonNumber from '../validators/prisonNumberValidator'
import validatePrisonerName from '../validators/prisonerNameValidator'
import formatErrors from '../../errorFormatter'
import RecipientFormService from './RecipientFormService'

export default class FindRecipientController {
  constructor(private readonly recipientFormService: RecipientFormService) {}

  async getFindRecipientByPrisonNumberView(req: Request, res: Response): Promise<void> {
    this.recipientFormService.resetForm(req)
    const view = new FindRecipientByPrisonNumberView(
      req.session?.findRecipientByPrisonNumberForm || {},
      req.flash('errors')
    )
    return res.render('pages/barcode/find-recipient-by-prison-number', { ...view.renderArgs })
  }

  async submitFindByPrisonNumber(req: Request, res: Response): Promise<void> {
    req.body.prisonNumber = req.body.prisonNumber.trim().toUpperCase()
    req.session.findRecipientByPrisonNumberForm = { ...req.body }
    const errors = validatePrisonNumber(req.body.prisonNumber)
    if (errors.length > 0) {
      req.flash('errors', formatErrors('prisonNumber', errors))
      return res.redirect('/barcode/find-recipient/by-prison-number')
    }

    // TODO SLM-121 - lookup contact by prison number and redirect to either create new contact by prison number or review recipients
    req.session.recipientForm.prisonNumber = req.session.findRecipientByPrisonNumberForm.prisonNumber
    req.session.findRecipientByPrisonNumberForm = undefined
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
  }

  async getFindRecipientByPrisonerNameView(req: Request, res: Response): Promise<void> {
    this.recipientFormService.resetForm(req)
    const view = new FindRecipientByPrisonerNameView(
      req.session?.findRecipientByPrisonerNameForm || {},
      req.flash('errors')
    )
    return res.render('pages/barcode/find-recipient-by-prisoner-name', { ...view.renderArgs })
  }

  async submitFindByPrisonerName(req: Request, res: Response): Promise<void> {
    req.body.prisonerName = req.body.prisonerName.trim()
    req.session.findRecipientByPrisonerNameForm = { ...req.body }
    const errors = validatePrisonerName(req.body.prisonerName)
    if (errors.length > 0) {
      req.flash('errors', formatErrors('prisonerName', errors))
      return res.redirect('/barcode/find-recipient/by-prisoner-name')
    }

    // TODO SLM-62 - find contacts by name and redirect to either choose contact or review recipients (save contacts on recipientForm if found!)
    req.session.recipientForm.prisonerName = req.session.findRecipientByPrisonerNameForm.prisonerName
    req.session.findRecipientByPrisonerNameForm = undefined
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
  }
}
