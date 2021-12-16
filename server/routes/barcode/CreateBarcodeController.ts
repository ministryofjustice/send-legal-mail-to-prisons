import { Request, Response } from 'express'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'

export default class CreateBarcodeController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async submitCreateBarcode(req: Request, res: Response): Promise<void> {
    return this.createBarcodeService.createBarcode().then(barcode => {
      req.session.barcode = barcode
      return res.redirect('/barcode/find-recipient')
    })
  }
}
