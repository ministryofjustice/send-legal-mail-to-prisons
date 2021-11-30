import express, { Router } from 'express'
import ScanBarcodeController from '../../routes/scan/ScanBarcodeController'
import authorisationMiddleware from '../authorisationMiddleware'

export default function setupScanBarcode(): Router {
  const router = express.Router()
  const scanBarcodeController = new ScanBarcodeController()

  router.use('/scan-barcode', authorisationMiddleware(['SLM_SCAN_BARCODE']))
  router.get('/scan-barcode', (req, res) => scanBarcodeController.getScanBarcodeView(req, res))

  return router
}
