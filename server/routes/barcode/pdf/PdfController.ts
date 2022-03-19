import { Request, Response } from 'express'
import moment from 'moment'
import type { PdfForm } from 'forms'
import PdfControllerView, { ENVELOPE_SIZES } from './PdfControllerView'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'
import logger from '../../../../logger'
import config from '../../../config'
import formatErrors from '../../errorFormatter'

export default class PdfController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async getEnvelopeSizeView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    const view = new PdfControllerView(req.session.pdfForm || {}, '', req.flash('errors'))
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

    try {
      req.session.recipients = await this.createBarcodeService.addBarcodeValuesToRecipients(
        req.session.recipients,
        req.session.slmToken,
        req.ip
      )
    } catch (error) {
      logger.error('An error was received when trying to assign a barcode to ', error)
      // TODO - likely there will be a requirement to redirect user to a service outage page here.
      req.flash('errors', [{ text: 'There was an error generating the barcode, please try again' }])
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

    req.session.pdfRecipients = [...req.session.recipients]
    req.session.recipients = undefined

    const numberOfCoversheets = req.session.pdfRecipients.length
    const filename = this.pdfFilename(numberOfCoversheets, this.envelopeSize(req.session.pdfForm))
    const { envelopeSize } = req.session.pdfForm

    return res.render('pages/barcode/pdf/print-coversheets', {
      envelopeSize,
      numberOfCoversheets,
      filename,
    })
  }

  async downloadPdf(req: Request, res: Response): Promise<void> {
    if (!req.session.pdfRecipients) {
      return res.redirect('/barcode/find-recipient')
    }
    if (!req.session.pdfForm) {
      return res.redirect('/barcode/pdf/select-envelope-size')
    }

    try {
      const barcodeImages = await Promise.all(
        req.session.pdfRecipients.map(async recipient => {
          return this.createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)
        })
      )

      const numberOfCoversheets = req.session.pdfRecipients.length
      const envelopeSize = this.envelopeSize(req.session.pdfForm)
      const filename = this.pdfFilename(numberOfCoversheets, envelopeSize)

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
        { filename, contentDisposition: 'attachment' }
      )
    } catch (error) {
      logger.error('There was an error generating the barcode images for the coversheet PDF', error)
      // TODO - need to work out what to do here if there was an error - the context in which this request handler method
      // is called is to download a PDF to the browser. The browser is not expecting to render a webpage, so unclear at
      // this point what/how we can tell the user anything.
      throw error
    }
  }

  private pdfFilename(numberOfCoversheets: number, envelopeSize: string): string {
    const today = moment().format('YYYY-MM-DD')
    return `SendLegalMail-${today}-${numberOfCoversheets}-${envelopeSize}.pdf`
  }

  private envelopeSize(pdfForm: PdfForm): string {
    return ENVELOPE_SIZES.find(envelopeSpec => envelopeSpec.key === pdfForm.envelopeSize).label
  }
}
