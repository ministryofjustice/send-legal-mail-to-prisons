import { Request, Response } from 'express'
import moment from 'moment'
import GenerateBarcodeImageView from './GenerateBarcodeImageView'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'
import { Recipient } from '../../../@types/prisonTypes'
import logger from '../../../../logger'

export default class GenerateBarcodeImageController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getGenerateImageView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    try {
      req.session.recipients = await this.createBarcodeService.addBarcodeValuesToRecipients(
        req.session.recipients,
        req.session.createBarcodeAuthToken
      )

      const barcodeImages = await Promise.all(
        req.session.recipients.map(async recipient => {
          try {
            return {
              barcodeImageUrl: await this.createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient),
              barcodeImageName: this.barcodeFilename(recipient),
            }
          } catch (error) {
            logger.error(`Could not generate a barcode for ${recipient.prisonNumber}, ${error}`)
            return undefined
          }
        })
      )

      const view = new GenerateBarcodeImageView(barcodeImages)
      return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
    } catch (error) {
      logger.error(`An error was received when trying to create the barcode image: ${JSON.stringify(error)}`)
      req.flash('errors', [{ text: 'There was an error generating the barcode, please try again' }])
      return res.redirect('/barcode/choose-barcode-option')
    }
  }

  private barcodeFilename(recipient: Recipient): string {
    const today = moment().format('DD-MM-YYYY')
    return `${recipient.prisonerName} ${recipient.prisonNumber} ${today}.png`.replace(/ /g, '-')
  }
}
