import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import PdfController from './PdfController'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'

jest.mock('./envelopeSizeOptionValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
  renderPDF: jest.fn(),
}

const createBarcodeService = {
  generateBarcodeValue: jest.fn(),
  generateAddressAndBarcodeDataUrlImage: jest.fn(),
  addBarcodeValuesToRecipients: jest.fn(),
}

describe('PdfController', () => {
  const pdfController = new PdfController(createBarcodeService as unknown as CreateBarcodeService)

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    res.renderPDF.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
    createBarcodeService.generateBarcodeValue.mockReset()
    createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockReset()
    createBarcodeService.addBarcodeValuesToRecipients.mockReset()
  })

  describe('getEnvelopeSizeView', () => {
    it('should render view', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]

      await pdfController.getEnvelopeSizeView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith(
        'pages/barcode/pdf/select-envelope-size',
        expect.objectContaining({ errors: [], form: {} })
      )
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.getEnvelopeSizeView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })

  describe('submitEnvelopeSize', () => {
    const mockValidateEnvelopeSizeOption = validateEnvelopeSizeOption as jest.MockedFunction<
      typeof validateEnvelopeSizeOption
    >

    it('should redirect to pdf print given envelope size is valid', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      req.body = { envelopeSize: 'dl' }
      mockValidateEnvelopeSizeOption.mockReturnValue([])
      createBarcodeService.addBarcodeValuesToRecipients.mockReturnValue([
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ])

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/print')
      expect(req.session.recipients).toStrictEqual([
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ])
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given envelope size is not valid', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      req.body = {}
      mockValidateEnvelopeSizeOption.mockReturnValue(['Select an envelope size'])

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#envelopeSize', text: 'Select an envelope size' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
    })
  })

  describe('getPrintCoverSheetView', () => {
    it('should render view', async () => {
      req.session.recipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ]
      req.session.pdfForm = { envelopeSize: 'dl' }

      await pdfController.getPrintCoverSheetView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith(
        'pages/barcode/pdf/print-coversheets',
        expect.objectContaining({ errors: [], form: { envelopeSize: 'dl' } })
      )
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.getPrintCoverSheetView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given no pdfForm in the session', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      req.session.pdfForm = undefined

      await pdfController.getPrintCoverSheetView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
    })
  })

  describe('downloadPdf', () => {
    it('should download pdf', async () => {
      req.session.recipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ]
      req.session.pdfForm = { envelopeSize: 'dl' }
      createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockImplementation(
        recipient => `${recipient.prisonerName}-barcode-data-url`
      )
      await pdfController.downloadPdf(req as unknown as Request, res as unknown as Response)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pdf/barcode-cover-sheet',
        expect.objectContaining({ barcodeImages: ['John Smith-barcode-data-url'], envelopeSize: 'dl' }),
        { contentDisposition: 'attachment', filename: 'John-Smith-A1234BC.pdf' }
      )
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.downloadPdf(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given no pdfForm in the session', async () => {
      req.session.recipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ]
      req.session.pdfForm = undefined

      await pdfController.downloadPdf(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
    })
  })
})