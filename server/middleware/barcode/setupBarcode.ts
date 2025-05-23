import express, { Router } from 'express'
import FindRecipientController from '../../routes/barcode/recipients/FindRecipientController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'
import ReviewRecipientsController from '../../routes/barcode/review/ReviewRecipientsController'
import CreateContactByPrisonNumberController from '../../routes/barcode/contacts/CreateContactByPrisonNumberController'
import GenerateBarcodeImageController from '../../routes/barcode/image/GenerateBarcodeImageController'
import PdfController from '../../routes/barcode/pdf/PdfController'
import ChooseBarcodeOptionController from '../../routes/barcode/options/ChooseBarcodeOptionController'
import CreateContactByPrisonerNameController from '../../routes/barcode/contacts/CreateContactByPrisonerNameController'
import ContactService from '../../services/contacts/ContactService'
import RecipientFormService from '../../routes/barcode/recipients/RecipientFormService'
import ChooseContactController from '../../routes/barcode/contacts/ChooseContactController'
import EditContactController from '../../routes/barcode/contacts/EditContactController'
import PrisonService from '../../services/prison/PrisonService'

export default function setUpCreateBarcode(
  createBarcodeService: CreateBarcodeService,
  prisonService: PrisonService,
  contactService: ContactService,
  recipientFormService: RecipientFormService,
): Router {
  const router = express.Router()
  const findRecipientController = new FindRecipientController(recipientFormService, contactService)
  const chooseContactController = new ChooseContactController(recipientFormService)
  const createContactByPrisonNumberController = new CreateContactByPrisonNumberController(
    prisonService,
    contactService,
    recipientFormService,
  )
  const createContactByPrisonerNameController = new CreateContactByPrisonerNameController(
    prisonService,
    contactService,
    recipientFormService,
  )
  const reviewRecipientsController = new ReviewRecipientsController(prisonService)
  const chooseBarcodeOptionController = new ChooseBarcodeOptionController()
  const generateImageController = new GenerateBarcodeImageController(createBarcodeService)
  const pdfController = new PdfController(createBarcodeService)
  const editContactController = new EditContactController(prisonService, contactService, recipientFormService)

  router.get('/find-recipient', (req, res) => res.redirect('/barcode/find-recipient/by-prison-number'))
  router.get('/find-recipient/by-prison-number', (req, res) =>
    findRecipientController.getFindRecipientByPrisonNumberView(req, res),
  )
  router.post('/find-recipient/by-prison-number', (req, res) => {
    findRecipientController.submitFindByPrisonNumber(req, res)
  })

  router.get('/find-recipient/by-prisoner-name', (req, res) =>
    findRecipientController.getFindRecipientByPrisonerNameView(req, res),
  )
  router.post('/find-recipient/by-prisoner-name', (req, res) =>
    findRecipientController.submitFindByPrisonerName(req, res),
  )

  router.get('/find-recipient/choose-contact', (req, res) => chooseContactController.getChooseContact(req, res))
  router.post('/find-recipient/choose-contact', (req, res) => chooseContactController.submitChooseContact(req, res))

  router.get('/find-recipient/create-new-contact', (req, res) =>
    res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number'),
  )
  router.get('/find-recipient/create-new-contact/by-prison-number', (req, res) =>
    createContactByPrisonNumberController.getCreateNewContact(req, res),
  )
  router.post('/find-recipient/create-new-contact/by-prison-number', (req, res) =>
    createContactByPrisonNumberController.submitCreateNewContact(req, res),
  )

  router.get('/find-recipient/create-new-contact/by-prisoner-name', (req, res) =>
    createContactByPrisonerNameController.getCreateNewContact(req, res),
  )
  router.post('/find-recipient/create-new-contact/by-prisoner-name', (req, res) =>
    createContactByPrisonerNameController.submitCreateNewContact(req, res),
  )

  router.get('/review-recipients', (req, res) => reviewRecipientsController.getReviewRecipientsView(req, res))
  router.post('/review-recipients', (req, res) => reviewRecipientsController.postReviewRecipientsView(req, res))
  router.get('/review-recipients/remove/:recipientIdx', (req, res) =>
    reviewRecipientsController.removeRecipientByIndex(req, res),
  )

  router.get('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.getChooseBarcodeOptionView(req, res))
  router.post('/choose-barcode-option', (req, res) => chooseBarcodeOptionController.submitChooseBarcodeOption(req, res))

  router.get('/pdf/select-envelope-size', (req, res) => pdfController.getEnvelopeSizeView(req, res))
  router.post('/pdf/select-envelope-size', (req, res) => pdfController.submitEnvelopeSize(req, res))
  router.get('/pdf/print', (req, res) => pdfController.getPrintCoverSheetView(req, res))
  router.get('/pdf/download', (req, res) => pdfController.downloadPdf(req, res))

  router.get('/generate-barcode-image', (req, res) => generateImageController.getGenerateImageView(req, res))

  router.get('/edit-contact/:contactId', (req, res) => editContactController.getEditContact(req, res))
  router.post('/edit-contact', (req, res) => editContactController.submitUpdateContact(req, res))

  return router
}
