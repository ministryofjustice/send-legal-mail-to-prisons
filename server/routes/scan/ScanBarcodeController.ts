import { Request, Response } from 'express'
import ScanBarcodeView from './ScanBarcodeView'

export default class ScanBarcodeController {
  async getScanBarcodeView(req: Request, res: Response): Promise<void> {
    const view = new ScanBarcodeView(req.session?.scanBarcodeForm || {}, req.flash('errors'))

    return res.render('pages/scan/scan-barcode', { ...view.renderArgs })
  }
}
