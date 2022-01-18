import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import PdfController from './PdfController'
import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'

jest.mock('./envelopeSizeOptionValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

describe('PdfController', () => {
  const pdfController = new PdfController()

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
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
      req.session.pdfForm = { envelopeSize: 'dl' }
      mockValidateEnvelopeSizeOption.mockReturnValue(true)

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/print')
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to select-envelope-size given envelope size is not valid', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      mockValidateEnvelopeSizeOption.mockReturnValue(false)

      await pdfController.submitEnvelopeSize(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/pdf/select-envelope-size')
    })
  })

  describe('getPrintCoverSheetView', () => {
    it('should render view', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
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
})
