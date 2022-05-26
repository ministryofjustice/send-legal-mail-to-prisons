import { Request, Response } from 'express'
import SupportedPrisonsView from './SupportedPrisonsView'
import validatePrisonId from '../barcode/validators/prisonIdValidator'
import formatErrors from '../errorFormatter'
import PrisonService from '../../services/prison/PrisonService'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'
import logger from '../../../logger'

export default class SupportedPrisonsController {
  constructor(
    private readonly supportedPrisonsService: SupportedPrisonsService,
    private readonly prisonService: PrisonService
  ) {}

  async getSupportedPrisonsView(req: Request, res: Response): Promise<void> {
    try {
      const { supportedPrisons, unsupportedPrisons } = await this.prisonService.getPrisonsBySupported(req.user.token)

      const view = new SupportedPrisonsView(supportedPrisons, unsupportedPrisons, req.flash('errors'))

      return res.render('pages/prisons/supported-prisons', { ...view.renderArgs })
    } catch (error) {
      logger.error(`Unable to load supported and unsupported prisons due to error`, error)
      req.flash('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      return res.redirect('/supported-prisons')
    }
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
