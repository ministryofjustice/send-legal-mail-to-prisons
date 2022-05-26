import { Request, Response } from 'express'
import type { Prison } from 'prisonTypes'
import SupportedPrisonsView from './SupportedPrisonsView'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import logger from '../../../logger'
import validatePrisonId from '../barcode/validators/prisonIdValidator'
import formatErrors from '../errorFormatter'

export default class SupportedPrisonsController {
  constructor(
    private readonly supportedPrisonsService: SupportedPrisonsService,
    private readonly prisonRegisterService: PrisonRegisterService
  ) {}

  async getSupportedPrisonsView(req: Request, res: Response): Promise<void> {
    let activePrisons: Array<Prison>
    try {
      activePrisons = await this.prisonRegisterService.getActivePrisonsFromPrisonRegister()
    } catch (error) {
      logger.error(`Unable to load prisons due to error`, error)
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      return res.redirect('/supported-prisons')
    }

    const supportedPrisonCodes = await this.supportedPrisonsService.getSupportedPrisons(req.user.token)
    const supportedPrisons = activePrisons.filter(prison => supportedPrisonCodes.supportedPrisons.includes(prison.id))
    const unsupportedPrisons = activePrisons.filter(
      prison => !supportedPrisonCodes.supportedPrisons.includes(prison.id)
    )

    const view = new SupportedPrisonsView(supportedPrisons, unsupportedPrisons, req.flash('errors'))
    return res.render('pages/prisons/supported-prisons', { ...view.renderArgs })
  }

  async addSupportedPrison(req: Request, res: Response): Promise<void> {
    const errors = formatErrors('prisonId', validatePrisonId(req.body.prisonId))
    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('/supported-prisons')
    }

    try {
      await this.supportedPrisonsService.addSupportedPrison(req.user.token, req.body.prisonId)
    } catch (error) {
      req.flash('errors', [{ href: '#prisonId', text: error.data.errorCode.userMessage }])
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
