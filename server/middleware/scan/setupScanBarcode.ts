import express, { Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'
import AppInsightsService from '../../services/AppInsightsService'

export default function setupScanBarcode(
  scanBarcodeService: ScanBarcodeService,
  appInsightsClient: AppInsightsService
): Router {
  const router = express.Router()

  const scanBarcodeController = new ScanBarcodeController(scanBarcodeService, appInsightsClient)

  router.use('/scan-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))
  router.post('/scan-barcode', (req, res) => scanBarcodeController.submitScannedBarcode(req, res))
  router.get('/scan-barcode/result', (req, res) => scanBarcodeController.getScanBarcodeResultView(req, res))
  router.get('/scan-barcode/problem', (req, res) => scanBarcodeController.getBarcodeScanProblemView(req, res))
  router.get('/scan-barcode/further-checks-needed', (req, res) =>
    scanBarcodeController.getFurtherChecksNeededView(req, res)
  )

  router.use('/manually-enter-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/manually-enter-barcode', (req, res) => scanBarcodeController.getManualBarcodeEntryView(req, res))
  router.post('/manually-enter-barcode', (req, res) => scanBarcodeController.submitManualBarcode(req, res))

  return router
}
