import { Request, Response } from 'express'
import FindRecipientView from './FindRecipientView'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import config from '../../config'
import { Prison } from '../../@types/prisonTypes'

export default class FindRecipientController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getFindRecipientView(req: Request, res: Response): Promise<void> {
    let activePrisons: Array<Prison>
    try {
      activePrisons = await this.prisonRegisterService.getActivePrisons()
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      activePrisons = []
    }

    const view = new FindRecipientView(
      req.session?.findRecipientForm || {},
      req.flash('errors'),
      req.session.barcode,
      req.session.barcodeImageUrl,
      this.filterSupportedPrisons(activePrisons)
    )
    return res.render('pages/barcode/find-recipient', { ...view.renderArgs })
  }

  private filterSupportedPrisons(activePrisons: Array<Prison>): Array<Prison> {
    if (!config.supportedPrisons || config.supportedPrisons === '') {
      return activePrisons
    }

    const supportedPrisons: Array<string> = config.supportedPrisons
      .split(',')
      .map(prisonId => prisonId.trim().toUpperCase())
    return activePrisons.filter(prison => supportedPrisons.includes(prison.id.toUpperCase()))
  }
}
