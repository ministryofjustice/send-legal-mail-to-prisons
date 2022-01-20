import { Request, Response } from 'express'
import PdfControllerView from './PdfControllerView'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import logger from '../../../logger'

export default class PdfController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

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
      return res.redirect('/barcode/pdf/select-envelope-size')
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

    req.session.recipients = await this.createBarcodeService.addBarcodeValuesToRecipients(
      req.session.recipients,
      req.session.createBarcodeAuthToken
    )

    const view = new PdfControllerView(req.session.pdfForm, req.flash('errors'))
    return res.render('pages/barcode/pdf/print-coversheets', { ...view.renderArgs })
  }

  async submitPrintCoverSheet(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }
    if (!req.session.pdfForm) {
      return res.redirect('/barcode/pdf/select-envelope-size')
    }

    const barcodeImages = await Promise.all(
      req.session.recipients.map(async recipient => {
        try {
          return await this.createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)
        } catch (error) {
          logger.error(`Could not generate a barcode for ${recipient.prisonNumber}, ${error}`)
          return undefined
        }
      })
    )

    return res.renderPDF('pdf/barcode-cover-sheet', {
      envelopeSize: req.session.pdfForm.envelopeSize,
      barcodeImages,
      printDebugInfo: true,
    })
  }
}
