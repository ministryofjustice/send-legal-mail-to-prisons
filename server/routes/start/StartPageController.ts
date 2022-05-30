import { Request, Response } from 'express'
import PrisonService from '../../services/prison/PrisonService'

export default class StartPageController {
  constructor(private readonly prisonService: PrisonService) {}

  async getStartPageView(req: Request, res: Response): Promise<void> {
    const supportedPrisons = await this.prisonService.getSupportedPrisons()
    const supportedPrisonNames = supportedPrisons
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(prison => prison.name)
    res.render('pages/start/legal-sender-start-page', { prisonNames: supportedPrisonNames })
  }
}
