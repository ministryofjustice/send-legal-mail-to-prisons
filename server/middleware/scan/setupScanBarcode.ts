import express, { RequestHandler, Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'
import AppInsightsService from '../../services/AppInsightsService'
import VerifyBarcodeErrorResponseMapper from '../../routes/scan/VerifyBarcodeErrorResponseMapper'
import PrisonService from '../../services/prison/PrisonService'
import asyncMiddleware from '../asyncMiddleware'

export default function setupScanBarcode(
  scanBarcodeService: ScanBarcodeService,
  prisonService: PrisonService,
  appInsightsClient: AppInsightsService,
): Router {
  const router = express.Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const scanBarcodeController = new ScanBarcodeController(
    scanBarcodeService,
    new VerifyBarcodeErrorResponseMapper(prisonService),
    appInsightsClient,
  )

  router.use('/scan-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))
  post('/scan-barcode', (req, res) => scanBarcodeController.submitScannedBarcode(req, res))
  get('/scan-barcode/result', (req, res) => scanBarcodeController.getScanBarcodeResultView(req, res))
  get('/scan-barcode/problem', (req, res) => scanBarcodeController.getBarcodeScanProblemView(req, res))
  get('/scan-barcode/further-checks-needed', (req, res) => scanBarcodeController.getFurtherChecksNeededView(req, res))

  router.use('/manually-enter-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  get('/manually-enter-barcode', (req, res) => scanBarcodeController.getManualBarcodeEntryView(req, res))
  post('/manually-enter-barcode', (req, res) => scanBarcodeController.submitManualBarcode(req, res))

  return router
}
