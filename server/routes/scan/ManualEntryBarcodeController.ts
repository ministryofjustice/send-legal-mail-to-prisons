import { Request, Response } from 'express'
import ManualEntryBarcodeView from './ManualEntryBarcodeView'
import validate from './ManualEntryBarcodeFormValidator'

export default class ManualEntryBarcodeController {
  async getManualBarcodeEntryView(req: Request, res: Response): Promise<void> {
    const view = new ManualEntryBarcodeView(req.session?.manualEntryBarcodeForm || {}, req.flash('errors'))

    return res.render('pages/scan/manual-barcode-entry', { ...view.renderArgs })
  }

  async submitManualBarcode(req: Request, res: Response): Promise<void> {
    req.session.manualEntryBarcodeForm = { ...req.body }
    if (!validate(req.session.manualEntryBarcodeForm, req)) {
      return res.redirect('manually-enter-barcode')
    }

    return res.redirect('manually-enter-barcode')
  }
}
