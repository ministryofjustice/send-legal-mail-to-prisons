import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/FindRecipientController'

export default function setUpCreateBarcode(): Router {
  const router = express.Router()
  const findRecipientController = new FindRecipientController()

  router.get('/find-recipient', (req, res) => findRecipientController.getFindRecipientView(req, res))

  return router
}
