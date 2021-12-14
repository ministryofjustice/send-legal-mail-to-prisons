import express, { Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'

export default function setupScanBarcode(scanBarcodeService: ScanBarcodeService): Router {
  const router = express.Router()

  const scanBarcodeController = new ScanBarcodeController(scanBarcodeService)

  router.use('/scan-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))
  router.get('/scan-barcode/result', (req, res) => scanBarcodeController.getScanBarcodeResultView(req, res))

  router.use('/manually-enter-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/manually-enter-barcode', (req, res) => scanBarcodeController.getManualBarcodeEntryView(req, res))
  router.post('/manually-enter-barcode', (req, res) => scanBarcodeController.submitManualBarcode(req, res))
  router.get('/manually-enter-barcode/report-problem', (req, res) =>
    scanBarcodeController.getReportManualBarcodeEntryProblemView(req, res)
  )

  return router
}
