import { Request, Response } from 'express'
import SupportedPrisonsView from './SupportedPrisonsView'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'

export default class SupportedPrisonsController {
  constructor(private readonly supportedPrisonsService: SupportedPrisonsService) {}

  async getSupportedPrisonsView(req: Request, res: Response): Promise<void> {
    const response = await this.supportedPrisonsService.getSupportedPrisons(req.user.token)
    const view = new SupportedPrisonsView(response.supportedPrisons, req.flash('errors'))

    return res.render('pages/prisons/supported-prisons', { ...view.renderArgs })
  }

  async addSupportedPrison(req: Request, res: Response): Promise<void> {
    try {
      await this.supportedPrisonsService.addSupportedPrison(req.user.token, req.body.addPrison)
    } catch (error) {
      req.flash('errors', [{ href: '#addPrison', text: error.data.errorCode.userMessage }])
    }

    return res.redirect('/supported-prisons')
  }

  async removeSupportedPrison(req: Request, res: Response): Promise<void> {
    try {
      await this.supportedPrisonsService.removeSupportedPrison(req.user.token, req.params.prisonId)
    } catch (error) {
      req.flash('errors', [{ text: error.data.errorCode.userMessage }])
    }

    return res.redirect('/supported-prisons')
  }
}
