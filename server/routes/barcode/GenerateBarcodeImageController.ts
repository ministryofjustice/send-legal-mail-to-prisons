import { Request, Response } from 'express'
import GenerateBarcodeImageView from './GenerateBarcodeImageView'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import logger from '../../../logger'

export default class GenerateBarcodeImageController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getGenerateImageView(req: Request, res: Response): Promise<void> {
    let barcode = ''
    let barcodeImageBuffer
    try {
      barcode = await this.createBarcodeService.createBarcode(req.session.createBarcodeAuthToken)
      barcodeImageBuffer = await this.createBarcodeService.generateBarcodeImage(barcode)
    } catch (error) {
      logger.error(`An error was received when trying to create the barcode image: ${JSON.stringify(error)}`)
      return res.render('pages/barcode/review-recipients', {
        errors: [{ text: 'There was an error generating the barcode, please try again' }],
      })
    }
    const barcodeImageUrl = this.createBarcodeService.generateAddressAndBarcodeImage(barcodeImageBuffer)
    const barcodeImageName = 'John-Smith-A1234BC.png' // TODO SLM-67 When we capture the prison name and possibly number the image name should reflect this
    const view = new GenerateBarcodeImageView(barcode, barcodeImageUrl, barcodeImageName)
    return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
  }
}
