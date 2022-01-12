import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'
import validatePrisonNumber from './prisonNumberValidator'

export default class FindRecipientController {
  async getFindRecipientByPrisonNumberView(req: Request, res: Response): Promise<void> {
    const view = new FindRecipientView(
      req.session?.findRecipientForm || {},
      req.flash('errors'),
      req.session.barcode, // TODO - remove when temp create barcode button is not on Find Recipient screen
      req.session.barcodeImageUrl // TODO - remove when temp create barcode button is not on Find Recipient screen
    )
    return res.render('pages/barcode/find-recipient-by-prison-number', { ...view.renderArgs })
  }

  async submitFindByPrisonNumber(req: Request, res: Response): Promise<void> {
    req.session.findRecipientForm = { ...req.body }
    if (!validatePrisonNumber(req)) {
      return res.redirect('/barcode/find-recipient')
    }

    // TODO - lookup contact by prison number and redirect to appropriate endpoint
    return res.redirect('/barcode/find-recipient/create-new-contact')
  }
}
