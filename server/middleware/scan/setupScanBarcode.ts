import express, { Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import ManualEntryBarcodeController from '../../routes/scan/ManualEntryBarcodeController'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'

export default function setupScanBarcode(): Router {
  const router = express.Router()
  const scanBarcodeController = new ScanBarcodeController()
  const manualEntryBarcodeController = new ManualEntryBarcodeController()

  router.use('/scan-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))

  router.use('/manually-enter-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/manually-enter-barcode', (req, res) => manualEntryBarcodeController.getManualBarcodeEntryView(req, res))
  router.post('/manually-enter-barcode', (req, res) => manualEntryBarcodeController.submitManualBarcode(req, res))
  router.get('/manually-enter-barcode/report-problem', (req, res) =>
    manualEntryBarcodeController.getReportManualBarcodeEntryProblemView(req, res)
  )

  return router
}
