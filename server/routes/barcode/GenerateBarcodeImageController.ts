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

    try {
      const recipient = req.session.recipients[0]
      const barcodeData = await this.createBarcodeService.generateBarcode(req.session.createBarcodeAuthToken, recipient)
      const barcodeImageName = this.barcodeFilename(recipient)
      this.clearForms(req)

      const view = new GenerateBarcodeImageView(barcodeData.barcodeImageDataUrl, barcodeImageName)
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

  // TODO this is to allow us to go back and start again - will need to think hard about the flow on SLM-83 (multiple recipients)
  private clearForms(req: Request): void {
    req.session.recipients = null
    req.session.findRecipientForm = null
    req.session.createNewContactForm = null
  }
}
