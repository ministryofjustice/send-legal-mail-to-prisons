import { Request, Response } from 'express'
import PdfControllerView from './PdfControllerView'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'
import logger from '../../../../logger'
import { Recipient } from '../../../@types/prisonTypes'
import config from '../../../config'
import formatErrors from '../../errorFormatter'

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
    const errors = validateEnvelopeSizeOption(req.body.envelopeSize)
    if (errors.length > 0) {
      req.flash('errors', formatErrors('envelopeSize', errors))
      return res.redirect('/barcode/pdf/select-envelope-size')
    }

    req.session.recipients = await this.createBarcodeService.addBarcodeValuesToRecipients(
      req.session.recipients,
      req.session.createBarcodeAuthToken
    )

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

  async downloadPdf(req: Request, res: Response): Promise<void> {
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

    // TODO - will need to work out what to do with this when we support multiple recipients - SLM-79
    const pdfFilename = this.pdfFilename(req.session.recipients[0])

    return res.renderPDF(
      'pdf/barcode-cover-sheet',
      {
        envelopeSize: req.session.pdfForm.envelopeSize,
        barcodeImages,
        printDebugInfo: config.coversheetPdf.printDebugInfo,
        addressLabelWidth: config.coversheetPdf.addressLabelWidth,
        xOffsetDl: config.coversheetPdf.xOffsetDl,
        yOffsetDl: config.coversheetPdf.yOffsetDl,
        xOffsetC5: config.coversheetPdf.xOffsetC5,
        yOffsetC5: config.coversheetPdf.yOffsetC5,
        xOffsetC4: config.coversheetPdf.xOffsetC4,
        yOffsetC4: config.coversheetPdf.yOffsetC4,
      },
      { filename: pdfFilename, contentDisposition: 'attachment' }
    )
  }

  private pdfFilename(recipient: Recipient): string {
    return `${recipient.prisonerName} ${recipient.prisonNumber}.pdf`.replace(/ /g, '-')
  }
}
