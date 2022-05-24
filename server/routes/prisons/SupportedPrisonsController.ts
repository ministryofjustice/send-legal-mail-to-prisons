import { Request, Response } from 'express'
import SupportedPrisonsView from './SupportedPrisonsView'

export default class SupportedPrisonsController {
  async getSupportedPrisonsView(req: Request, res: Response): Promise<void> {
    const view = new SupportedPrisonsView(req.flash('errors'))

    return res.render('pages/prisons/supported-prisons', { ...view.renderArgs })
  }
}
