import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/FindRecipientController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import ReviewRecipientsController from '../../routes/barcode/ReviewRecipientsController'
import CreateContactController from '../../routes/barcode/CreateContactController'
import GenerateBarcodeImageController from '../../routes/barcode/GenerateBarcodeImageController'
import PdfController from '../../routes/barcode/PdfController'
import ChooseBarcodeOptionController from '../../routes/barcode/ChooseBarcodeOptionController'

export default function setUpCreateBarcode(
  createBarcodeService: CreateBarcodeService,
  prisonRegisterService: PrisonRegisterService
): Router {
  const router = express.Router()
  const findRecipientController = new FindRecipientController()
  const createContactController = new CreateContactController(prisonRegisterService)
  const reviewRecipientsController = new ReviewRecipientsController()
  const chooseBarcodeOptionController = new ChooseBarcodeOptionController()
  const generateImageController = new GenerateBarcodeImageController(createBarcodeService)
  const pdfController = new PdfController()

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

  router.get('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.getChooseBarcodeOptionView(req, res))
  router.post('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.submitChooseBarcodeOption(req, res))

  router.get('/pdf/select-envelope-size', (req, res) => pdfController.getEnvelopeSizeView(req, res))

  router.get('/generate-barcode-image', (req, res) => generateImageController.getGenerateImageView(req, res))

  return router
}
