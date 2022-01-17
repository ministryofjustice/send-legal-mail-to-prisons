import { Request, Response } from 'express'
import ChooseBarcodeOptionView from './ChooseBarcodeOptionView'
import validateBarcodeOption from './barcodeOptionValidator'

export default class ChooseBarcodeOptionController {
  async getChooseBarcodeOptionView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.chooseBarcodeOptionForm = req.session.chooseBarcodeOptionForm || {}

    const view = new ChooseBarcodeOptionView(req.session.chooseBarcodeOptionForm || {}, req.flash('errors'))
    return res.render('pages/barcode/choose-barcode-option', { ...view.renderArgs })
  }

  async submitChooseBarcodeOption(req: Request, res: Response): Promise<void> {
    req.session.chooseBarcodeOptionForm = { ...req.body }
    if (!validateBarcodeOption(req)) {
      return res.redirect('/barcode/choose-barcode-option')
    }

    return req.session.chooseBarcodeOptionForm.barcodeOption === 'coversheet'
      ? res.redirect('/barcode/pdf/select-envelope-size')
      : res.redirect('/barcode/generate-barcode-image')
  }
}
