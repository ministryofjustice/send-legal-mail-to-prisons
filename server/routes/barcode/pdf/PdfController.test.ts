import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import PdfController from './PdfController'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'

jest.mock('./envelopeSizeOptionValidator')

const req = {
  session: { barcodeUser: { token: 'some-token' } } as SessionData,
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
    req.session = { barcodeUser: { token: 'some-token' } } as SessionData
    req.flash.mockReset()
    createBarcodeService.generateBarcodeValue.mockReset()
    createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockReset()
    createBarcodeService.addBarcodeValuesToRecipients.mockReset()
  })

  describe('getEnvelopeSizeView', () => {
    it('should render view', async () => {
      req.session.recipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
        },
      ]

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

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given envelope size is not valid', async () => {
      req.session.recipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
        },
      ]
      req.body = {}
      mockValidateEnvelopeSizeOption.mockReturnValue(['Select an envelope size'])

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#envelopeSize', text: 'Select an envelope size' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
    })

    describe('Single recipient', () => {
      it('should redirect to pdf print given envelope size is valid', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
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

      it('should render errors if generating barcode value from the API fails', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        req.body = { envelopeSize: 'dl' }
        mockValidateEnvelopeSizeOption.mockReturnValue([])
        createBarcodeService.addBarcodeValuesToRecipients.mockRejectedValue('An error returned from barcode API')

        await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })
    })

    describe('Multiple recipients', () => {
      it('should redirect to pdf print given envelope size is valid', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        req.body = { envelopeSize: 'dl' }
        mockValidateEnvelopeSizeOption.mockReturnValue([])
        createBarcodeService.addBarcodeValuesToRecipients.mockResolvedValue([
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '123456789012',
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '999988887777',
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
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '999988887777',
          },
        ])
      })

      it('should render errors if generating barcode value from the API fails for any recipient', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockRejectedValue('An error returned from barcode API')

        await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })
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

      expect(res.render).toHaveBeenCalledWith('pages/barcode/pdf/print-coversheets', {
        envelopeSize: 'dl',
        filename: `SendLegalMail-${moment().format('YYYY-MM-DD')}-1-DL.pdf`,
        numberOfCoversheets: 1,
      })
      expect(req.session.recipients).toBeUndefined()
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
      req.session.pdfRecipients = [
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
        { contentDisposition: 'attachment', filename: `SendLegalMail-${moment().format('YYYY-MM-DD')}-1-DL.pdf` }
      )
    })

    it('should throw error if generating barcode data url image fails', async () => {
      req.session.pdfRecipients = [
        {
          prisonerName: 'John Smith',
          prisonNumber: 'A1234BC',
          prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          barcodeValue: '123456789012',
        },
      ]
      req.session.pdfForm = { envelopeSize: 'dl' }
      createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockRejectedValueOnce('Error generating image')

      try {
        await pdfController.downloadPdf(req as unknown as Request, res as unknown as Response)
        fail('Was expecting pdfController.downloadPdf to have thrown an error but it did not')
      } catch (error) {
        expect(error).toBe('Error generating image')
      }
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.downloadPdf(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given no pdfForm in the session', async () => {
      req.session.pdfRecipients = [
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
