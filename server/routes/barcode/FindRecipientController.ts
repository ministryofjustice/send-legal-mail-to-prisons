import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'
import validatePrisonNumber from './prisonNumberValidator'

export default class FindRecipientController {
  async getFindRecipientByPrisonNumberView(req: Request, res: Response): Promise<void> {
    const view = new FindRecipientView(req.session?.findRecipientForm || {}, req.flash('errors'))
    return res.render('pages/barcode/find-recipient-by-prison-number', { ...view.renderArgs })
  }

  async submitFindByPrisonNumber(req: Request, res: Response): Promise<void> {
    req.body.prisonNumber = req.body.prisonNumber.trim().toUpperCase()
    req.session.findRecipientForm = { ...req.body }
    if (!validatePrisonNumber(req)) {
      return res.redirect('/barcode/find-recipient')
    }

    // TODO - lookup contact by prison number and redirect to appropriate endpoint
    return res.redirect('/barcode/find-recipient/create-new-contact')
  }
}
