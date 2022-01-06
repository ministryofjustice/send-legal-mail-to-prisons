import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'

export default class FindRecipientController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getFindRecipientView(req: Request, res: Response): Promise<void> {
    return this.prisonRegisterService.getActivePrisons().then(activePrisons => {
      const view = new FindRecipientView(
        req.session?.findRecipientForm || {},
        req.flash('errors'),
        req.session.barcode,
        req.session.barcodeImageUrl,
        activePrisons
      )
      return res.render('pages/barcode/find-recipient', { ...view.renderArgs })
    })
  }
}
