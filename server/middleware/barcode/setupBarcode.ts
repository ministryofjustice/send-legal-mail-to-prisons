import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/FindRecipientController'
import CreateBarcodeController from '../../routes/barcode/CreateBarcodeController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'

export default function setUpCreateBarcode(createBarcodeService: CreateBarcodeService): Router {
  const router = express.Router()
  const createBarcodeController = new CreateBarcodeController(createBarcodeService)
  const findRecipientController = new FindRecipientController()

  router.post('', (req, res) => createBarcodeController.submitCreateBarcode(req, res))
  router.get('/find-recipient', (req, res) => findRecipientController.getFindRecipientView(req, res))

  return router
}
