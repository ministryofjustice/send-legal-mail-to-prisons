import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/FindRecipientController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import ReviewRecipientsController from '../../routes/barcode/ReviewRecipientsController'
import CreateContactController from '../../routes/barcode/CreateContactController'
import GenerateBarcodeImageController from '../../routes/barcode/GenerateBarcodeImageController'

export default function setUpCreateBarcode(
  createBarcodeService: CreateBarcodeService,
  prisonRegisterService: PrisonRegisterService
): Router {
  const router = express.Router()
  const findRecipientController = new FindRecipientController()
  const createContactController = new CreateContactController(prisonRegisterService)
  const reviewRecipientsController = new ReviewRecipientsController()

  router.get('/find-recipient', (req, res) => findRecipientController.getFindRecipientByPrisonNumberView(req, res))
  router.post('/find-recipient/by-prison-number', (req, res) =>
    findRecipientController.submitFindByPrisonNumber(req, res)
  )

  router.get('/find-recipient/create-new-contact', (req, res) =>
    createContactController.getCreateNewContactView(req, res)
  )
  router.post('/find-recipient/create-new-contact', (req, res) =>
    createContactController.submitCreateNewContact(req, res)
  )

  router.get('/review-recipients', (req, res) => reviewRecipientsController.getReviewRecipientsView(req, res))

  router.get('/generate-barcode-image', (req, res) => generateImageController.getGenerateImageView(req, res))

  return router
}
