import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'
import validatePrisonNumber from './prisonNumberValidator'
import validatePrisonerName from './prisonerNameValidator'

export default class FindRecipientController {
  async getFindRecipientByPrisonNumberView(req: Request, res: Response): Promise<void> {
    const view = new FindRecipientView(req.session?.findRecipientForm || {}, req.flash('errors'))
    return res.render('pages/barcode/find-recipient-by-prison-number', { ...view.renderArgs })
  }

  async submitFindByPrisonNumber(req: Request, res: Response): Promise<void> {
    req.body.prisonNumber = req.body.prisonNumber.trim().toUpperCase()
    req.session.findRecipientForm = { ...req.body }
    const errors = validatePrisonNumber(req.body.prisonNumber)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/by-prison-number')
    }

    // TODO - lookup contact by prison number and redirect to appropriate endpoint
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
  }

  async getFindRecipientByPrisonerNameView(req: Request, res: Response): Promise<void> {
    const view = new FindRecipientView(req.session?.findRecipientForm || {}, req.flash('errors'))
    return res.render('pages/barcode/find-recipient-by-prisoner-name', { ...view.renderArgs })
  }

  async submitFindByPrisonerName(req: Request, res: Response): Promise<void> {
    req.body.prisonerName = req.body.prisonerName.trim()
    req.session.findRecipientForm = { ...req.body }
    const errors = validatePrisonerName(req.body.prisonerName)
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/barcode/find-recipient/by-prisoner-name')
    }

    // TODO SLM-81 redirect to the create new contact by prisoner name form when it is done
    return res.redirect('/barcode/find-recipient/by-prisoner-name')
  }
}
