import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/recipients/FindRecipientController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import ReviewRecipientsController from '../../routes/barcode/review/ReviewRecipientsController'
import CreateContactByPrisonNumberController from '../../routes/barcode/contacts/CreateContactByPrisonNumberController'
import GenerateBarcodeImageController from '../../routes/barcode/image/GenerateBarcodeImageController'
import PdfController from '../../routes/barcode/pdf/PdfController'
import ChooseBarcodeOptionController from '../../routes/barcode/options/ChooseBarcodeOptionController'

export default function setUpCreateBarcode(
  createBarcodeService: CreateBarcodeService,
  prisonRegisterService: PrisonRegisterService
): Router {
  const router = express.Router()
  const findRecipientController = new FindRecipientController()
  const createContactController = new CreateContactByPrisonNumberController(prisonRegisterService)
  const reviewRecipientsController = new ReviewRecipientsController()
  const chooseBarcodeOptionController = new ChooseBarcodeOptionController()
  const generateImageController = new GenerateBarcodeImageController(createBarcodeService)
  const pdfController = new PdfController(createBarcodeService)

  router.get('/find-recipient', (req, res) => res.redirect('/barcode/find-recipient/by-prison-number'))
  router.get('/find-recipient/by-prison-number', (req, res) =>
    findRecipientController.getFindRecipientByPrisonNumberView(req, res)
  )
  router.post('/find-recipient/by-prison-number', (req, res) =>
    findRecipientController.submitFindByPrisonNumber(req, res)
  )

  router.get('/find-recipient/by-prisoner-name', (req, res) =>
    findRecipientController.getFindRecipientByPrisonerNameView(req, res)
  )
  router.post('/find-recipient/by-prisoner-name', (req, res) =>
    findRecipientController.submitFindByPrisonerName(req, res)
  )

  router.get('/find-recipient/create-new-contact', (req, res) =>
    res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
  )
  router.get('/find-recipient/create-new-contact/by-prison-number', (req, res) =>
    createContactController.getCreateNewContactByPrisonNumberView(req, res)
  )
  router.post('/find-recipient/create-new-contact/by-prison-number', (req, res) =>
    createContactController.submitCreateNewContactByPrisonNumber(req, res)
  )

  router.get('/review-recipients', (req, res) => reviewRecipientsController.getReviewRecipientsView(req, res))
  router.get('/review-recipients/remove/:recipientIdx', (req, res) =>
    reviewRecipientsController.removeRecipientByIndex(req, res)
  )

  router.get('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.getChooseBarcodeOptionView(req, res))
  router.post('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.submitChooseBarcodeOption(req, res))

  router.get('/pdf/select-envelope-size', (req, res) => pdfController.getEnvelopeSizeView(req, res))
  router.post('/pdf/select-envelope-size', (req, res) => pdfController.submitEnvelopeSize(req, res))
  router.get('/pdf/print', (req, res) => pdfController.getPrintCoverSheetView(req, res))
  router.get('/pdf/download', (req, res) => pdfController.downloadPdf(req, res))

  router.get('/generate-barcode-image', (req, res) => generateImageController.getGenerateImageView(req, res))

  return router
}
