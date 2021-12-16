import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'

export default class FindRecipientController {
  async getFindRecipientView(req: Request, res: Response): Promise<void> {
    const view = new FindRecipientView(req.session?.findRecipientForm || {}, req.flash('errors'), req.session.barcode)
    return res.render('pages/barcode/find-recipient', { ...view.renderArgs })
  }
}
