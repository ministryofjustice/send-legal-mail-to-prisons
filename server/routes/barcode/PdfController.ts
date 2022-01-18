import { Request, Response } from 'express'
import PdfControllerView from './PdfControllerView'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'

export default class PdfController {
  async getEnvelopeSizeView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    const view = new PdfControllerView(req.session.pdfForm || {}, req.flash('errors'))
    return res.render('pages/barcode/pdf/select-envelope-size', { ...view.renderArgs })
  }

  async submitEnvelopeSize(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    req.session.pdfForm = { ...req.body }
    if (!validateEnvelopeSizeOption(req)) {
      res.redirect('/barcode/pdf/select-envelope-size')
    }

    return res.redirect('/barcode/pdf/print')
  }

  async getPrintCoverSheetView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }
    if (!req.session.pdfForm) {
      return res.redirect('/barcode/pdf/select-envelope-size')
    }

    const view = new PdfControllerView(req.session.pdfForm, req.flash('errors'))
    return res.render('pages/barcode/pdf/print-coversheets', { ...view.renderArgs })
  }
}
