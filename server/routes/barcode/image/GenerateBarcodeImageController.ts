import { Request, Response } from 'express'
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

      const recipient = req.session.recipients[0]
      const barcodeImageDataUrl = await this.createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)
      const barcodeImageName = this.barcodeFilename(recipient)

      const view = new GenerateBarcodeImageView(barcodeImageDataUrl, barcodeImageName)
      return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
    } catch (error) {
      logger.error(`An error was received when trying to create the barcode image: ${JSON.stringify(error)}`)
      req.flash('errors', [{ text: 'There was an error generating the barcode, please try again' }])
      return res.redirect('/barcode/choose-barcode-option')
    }
  }

  private barcodeFilename(recipient: Recipient): string {
    return `${recipient.prisonerName} ${recipient.prisonNumber}.png`.replace(/ /g, '-')
  }
}
