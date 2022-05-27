import { Request, Response } from 'express'
import filterSupportedPrisons from '../barcode/contacts/filterSupportedPrisons'
import PrisonService from '../../services/prison/PrisonService'

export default class StartPageController {
  constructor(private readonly prisonService: PrisonService) {}

  async getStartPageView(req: Request, res: Response): Promise<void> {
    const supportedPrisons = filterSupportedPrisons(await this.prisonService.getPrisons())
    const supportedPrisonNames = supportedPrisons
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(prison => prison.addressName)
    res.render('pages/start/legal-sender-start-page', { prisonNames: supportedPrisonNames })
  }
}
