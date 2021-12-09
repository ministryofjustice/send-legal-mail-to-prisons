import { Request, Response } from 'express'
import BarcodeEntryView from './BarcodeEntryView'

export default class ScanBarcodeController {
  async getScanBarcodeView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    return res.render('pages/scan/scan-barcode', { ...view.renderArgs })
  }
}
