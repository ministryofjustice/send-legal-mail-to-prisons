import express, { Router } from 'express'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'
import authorisationMiddleware from '../authorisationMiddleware'
import ManualEntryBarcodeController from '../../routes/scan/ManualEntryBarcodeController'

export default function setupScanBarcode(): Router {
  const router = express.Router()
  const scanBarcodeController = new ScanBarcodeController()
  const manualEntryBarcodeController = new ManualEntryBarcodeController()

  router.use('/scan-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))

  router.use('/manually-enter-barcode', authorisationMiddleware(['ROLE_SLM_SCAN_BARCODE']))
  router.get('/manually-enter-barcode', (req, res) => manualEntryBarcodeController.getManualBarcodeEntryView(req, res))
  router.post('/manually-enter-barcode', (req, res) => manualEntryBarcodeController.submitManualBarcode(req, res))

  return router
}
