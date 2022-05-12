import { SessionData } from 'express-session'
import { Request, Response } from 'express'
import ScanBarcodeController from './ScanBarcodeController'
import barcodeEntryFormValidator from './BarcodeEntryFormValidator'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'
import VerifyBarcodeErrorResponseMapper from './VerifyBarcodeErrorResponseMapper'
import AppInsightsService from '../../services/AppInsightsService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
  user: {},
  ip: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
  locals: {},
}
const scanBarcodeService = {
  verifyBarcode: jest.fn(),
  notifyMoreChecksRequested: jest.fn(),
}
const verifyBarcodeErrorResponseMapper = {
  mapErrorResponse: jest.fn(),
}
const appInsightsClient = {
  trackEvent: jest.fn(),
}
jest.mock('./BarcodeEntryFormValidator')
const validate = barcodeEntryFormValidator as jest.Mock

describe('ScanBarcodeController', () => {
  const scanBarcodeController = new ScanBarcodeController(
    scanBarcodeService as unknown as ScanBarcodeService,
    verifyBarcodeErrorResponseMapper as unknown as VerifyBarcodeErrorResponseMapper,
    appInsightsClient as unknown as AppInsightsService
  )

  afterEach(() => {
    jest.resetAllMocks()
    req.session = {} as SessionData
  })

  describe('getScanBarcodeView', () => {
    it('should render page for first barcode scan', async () => {
      req.session.scannedAtLeastOneBarcode = false
      req.session.barcodeEntryForm = { barcode: 'some-barcode' }
      req.flash.mockReturnValue([{ href: 'some-href', text: 'some-error' }])

      await scanBarcodeController.getScanBarcodeView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/scan/scan-barcode', {
        form: { barcode: 'some-barcode' },
        errors: [{ href: 'some-href', text: 'some-error' }],
      })
    })

    it('should render page for subsequent barcode scans', async () => {
      req.session.scannedAtLeastOneBarcode = true

      await scanBarcodeController.getScanBarcodeView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/scan/scan-another-barcode', { form: {}, errors: [] })
    })
  })

  describe('submitScannedBarcode', () => {
    req.user = { username: 'scanned-by-user' }
    req.ip = 'some-ip'
    req.body = { barcode: 'some-barcode' }

    it('should redirect to scan barcode if not valid', async () => {
      validate.mockReturnValue(false)

      await scanBarcodeController.submitScannedBarcode(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode')
    })

    it('should call API and show positive result', async () => {
      validate.mockReturnValue(true)
      scanBarcodeService.verifyBarcode.mockResolvedValue({ createdBy: 'created-by-user' })

      await scanBarcodeController.submitScannedBarcode(req as unknown as Request, res as unknown as Response)

      expect(scanBarcodeService.verifyBarcode).toHaveBeenCalledWith('some-barcode', 'scanned-by-user', 'some-ip')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(req.session.barcodeEntryForm.createdBy).toEqual('created-by-user')
    })

    it('should call API and show negative result', async () => {
      validate.mockReturnValue(true)
      scanBarcodeService.verifyBarcode.mockRejectedValue({ status: 400, errorCode: { code: 'some-error' } })
      verifyBarcodeErrorResponseMapper.mapErrorResponse.mockReturnValue({
        code: 'some-error',
        userMessage: 'some-message',
      })

      await scanBarcodeController.submitScannedBarcode(req as unknown as Request, res as unknown as Response)

      expect(scanBarcodeService.verifyBarcode).toHaveBeenCalledWith('some-barcode', 'scanned-by-user', 'some-ip')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(req.session.barcodeEntryForm.errorCode).toEqual({ code: 'some-error', userMessage: 'some-message' })
    })
  })

  describe('getManualBarcodeEntryView', () => {
    it('should render form', async () => {
      req.session.barcodeEntryForm = { barcode: 'some-barcode' }
      req.flash.mockReturnValue([{ href: 'some-href', text: 'some-error' }])

      await scanBarcodeController.getManualBarcodeEntryView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/scan/manual-barcode-entry', {
        form: { barcode: 'some-barcode' },
        errors: [{ href: 'some-href', text: 'some-error' }],
      })
    })
  })

  describe('submitManualBarcode', () => {
    req.user = { username: 'scanned-by-user' }
    req.ip = 'some-ip'
    req.body = { barcode: 'some-barcode' }

    it('should redirect to scan barcode if not valid', async () => {
      validate.mockReturnValue(false)

      await scanBarcodeController.submitManualBarcode(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/manually-enter-barcode')
    })

    it('should call API and show positive result', async () => {
      validate.mockReturnValue(true)
      scanBarcodeService.verifyBarcode.mockResolvedValue({ createdBy: 'created-by-user' })

      await scanBarcodeController.submitManualBarcode(req as unknown as Request, res as unknown as Response)

      expect(scanBarcodeService.verifyBarcode).toHaveBeenCalledWith('some-barcode', 'scanned-by-user', 'some-ip')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(req.session.barcodeEntryForm.createdBy).toEqual('created-by-user')
    })

    it('should call API and show negative result', async () => {
      validate.mockReturnValue(true)
      scanBarcodeService.verifyBarcode.mockRejectedValue({ status: 400, errorCode: { code: 'some-error' } })
      verifyBarcodeErrorResponseMapper.mapErrorResponse.mockReturnValue({
        code: 'some-error',
        userMessage: 'some-message',
      })

      await scanBarcodeController.submitManualBarcode(req as unknown as Request, res as unknown as Response)

      expect(scanBarcodeService.verifyBarcode).toHaveBeenCalledWith('some-barcode', 'scanned-by-user', 'some-ip')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(req.session.barcodeEntryForm.errorCode).toEqual({ code: 'some-error', userMessage: 'some-message' })
    })
  })

  describe('getBarcodeScanProblemView', () => {
    it('should redirect to the result view', async () => {
      res.locals = { user: { username: 'some-user', activeCaseLoadId: 'some-caseload' } }

      await scanBarcodeController.getBarcodeScanProblemView(req as unknown as Request, res as unknown as Response)

      expect(req.session.barcodeEntryForm.errorCode.code).toEqual('CANNOT_ENTER_BARCODE')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(appInsightsClient.trackEvent).toHaveBeenCalledWith('cannotEnterBarcode', {
        username: 'some-user',
        prison: 'some-caseload',
      })
    })
  })

  describe('getFurtherChecksNeededView', () => {
    it('should redirect to the result view', async () => {
      res.locals = { user: { username: 'some-user', activeCaseLoadId: 'some-caseload' } }
      req.user = { username: 'scanned-by-user' }
      req.ip = 'some-ip'
      req.session.barcodeEntryForm = { lastScannedBarcode: 'some-barcode' }

      await scanBarcodeController.getFurtherChecksNeededView(req as unknown as Request, res as unknown as Response)

      expect(scanBarcodeService.notifyMoreChecksRequested).toHaveBeenCalledWith(
        'some-barcode',
        'scanned-by-user',
        'some-ip'
      )
      expect(req.session.barcodeEntryForm.errorCode.code).toEqual('FURTHER_CHECKS_NEEDED')
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/result')
      expect(appInsightsClient.trackEvent).toHaveBeenCalledWith('furtherChecksNeeded', {
        username: 'some-user',
        prison: 'some-caseload',
      })
    })
  })

  describe('getScanBarcodeResultView', () => {
    it('should redirect to scan barcode if none scanned', async () => {
      await scanBarcodeController.getScanBarcodeResultView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode')
    })

    it('should render the results page', async () => {
      req.session.barcodeEntryForm = { lastScannedBarcode: 'some-barcode' }
      req.flash.mockReturnValue([{ href: 'some-href', text: 'some-error' }])

      await scanBarcodeController.getScanBarcodeResultView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/scan/scan-barcode-result', {
        form: { lastScannedBarcode: 'some-barcode' },
        errors: [{ href: 'some-href', text: 'some-error' }],
      })
      expect(req.session.scannedAtLeastOneBarcode).toBeTruthy()
    })
  })
})
