import { Request, Response } from 'express'
import moment from 'moment'
import type { Recipient } from 'prisonTypes'
import GenerateBarcodeImageView from './GenerateBarcodeImageView'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'
import logger from '../../../../logger'

export default class GenerateBarcodeImageController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getGenerateImageView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    try {
      logger.info(`Calling createBarcodeService with client IP: ${req.ip}`)
      req.session.recipients = await this.createBarcodeService.addBarcodeValuesToRecipients(
        req.session.recipients,
        req.session.slmToken,
        req.ip
      )

      const barcodeImages = await Promise.all(
        req.session.recipients.map(async recipient => {
          return {
            barcodeImageUrl: await this.createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient),
            barcodeImageName: this.barcodeFilename(recipient),
          }
        })
      )

      const view = new GenerateBarcodeImageView(barcodeImages)
      // Clear down the recipients so that barcodes cannot be created a second time if there are no errors
      req.session.recipients = undefined
      return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
    } catch (error) {
      logger.error('An error was received when trying to create the barcode image', error)
      // TODO - likely there will be a requirement to redirect user to a service outage page here.
      req.flash('errors', [{ text: 'There was an error generating the barcode, please try again' }])
      return res.redirect('/barcode/choose-barcode-option')
    }
  }

  private barcodeFilename(recipient: Recipient): string {
    const today = moment().format('YYYY-MM-DD')
    return `SendLegalMail-${recipient.prisonerName}-${today}.png`.replace(/ /g, '-')
  }
}
