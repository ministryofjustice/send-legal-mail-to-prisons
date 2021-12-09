import { Request, Response } from 'express'
import BarcodeEntryView from './BarcodeEntryView'
import validate from './BarcodeEntryFormValidator'

export default class ManualEntryBarcodeController {
  async getManualBarcodeEntryView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    return res.render('pages/scan/manual-barcode-entry', { ...view.renderArgs })
  }

  async submitManualBarcode(req: Request, res: Response): Promise<void> {
    req.session.barcodeEntryForm = { ...req.body }
    if (!validate(req.session.barcodeEntryForm, req)) {
      return res.redirect('manually-enter-barcode')
    }

    return res.redirect('manually-enter-barcode')
  }
}
