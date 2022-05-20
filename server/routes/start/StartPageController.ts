import { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import filterSupportedPrisons from '../barcode/contacts/filterSupportedPrisons'

export default class StartPageController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getStartPageView(req: Request, res: Response): Promise<void> {
    const supportedPrisons = filterSupportedPrisons(
      await this.prisonRegisterService.getActivePrisonsFromPrisonRegister()
    )
    const supportedPrisonNames = supportedPrisons
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(prison => prison.addressName)
    res.render('pages/start/legal-sender-start-page', { prisonNames: supportedPrisonNames })
  }
}
