import { Request, Response } from 'express'
import GenerateBarcodeImageView from './GenerateBarcodeImageView'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'

export default class GenerateBarcodeImageController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getGenerateImageView(req: Request, res: Response): Promise<void> {
    this.createBarcodeService.createBarcode(req.session.createBarcodeAuthToken).then(barcode => {
      this.createBarcodeService.generateBarcodeImage(barcode).then((barcodeImageBuffer: Buffer) => {
        const barcodeImageUrl = this.createBarcodeService.generateAddressAndBarcodeImage(barcodeImageBuffer)
        const barcodeImageName = 'John-Smith-A1234BC.png' // TODO SLM-67 When we capture the prison name and possibly number the image name should reflect this
        const view = new GenerateBarcodeImageView(barcode, barcodeImageUrl, barcodeImageName)
        return res.render('pages/barcode/generate-barcode-image', { ...view.renderArgs })
      })
    })
  }
}
