import { Request, Response } from 'express'
import GenerateBarcodeImageView from './GenerateBarcodeImageView'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import { Recipient } from '../../@types/prisonTypes'
import logger from '../../../logger'

export default class GenerateBarcodeImageController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getGenerateImageView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    const recipient = req.session.recipients[0]
    let barcode = ''
    let barcodeImageBuffer
    try {
      barcode = await this.createBarcodeService.createBarcode(req.session.createBarcodeAuthToken)
      barcodeImageBuffer = await this.createBarcodeService.generateBarcodeImage(barcode)
    } catch (error) {
      logger.error(`An error was received when trying to create the barcode image: ${JSON.stringify(error)}`)
      req.flash('errors', [{ text: 'There was an error generating the barcode, please try again' }])
      return res.redirect('/barcode/review-recipients')
    }
    const barcodeImageUrl = this.createBarcodeService.generateAddressAndBarcodeImage(barcodeImageBuffer, recipient)
    const barcodeImageName = this.barcodeFilename(recipient)
    const view = new GenerateBarcodeImageView(barcode, barcodeImageUrl, barcodeImageName)
    return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
  }

  private barcodeFilename(recipient: Recipient): string {
    return `${recipient.prisonerName} ${recipient.prisonNumber}.png`.replace(/ /g, '-')
  }
}
