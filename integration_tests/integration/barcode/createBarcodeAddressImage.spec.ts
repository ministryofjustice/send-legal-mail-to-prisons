import Page from '../../pages/page'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactPage from '../../pages/barcode/createNewContact'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'

context('Create Barcode Image', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    cy.task('stubGetPrisonRegister')
    cy.visit('/barcode/find-recipient')
    Page.verifyOnPage(FindRecipientByPrisonNumberPage).submitWithValidPrisonNumber()
    Page.verifyOnPage(CreateNewContactPage).submitWithValidValues()
    Page.verifyOnPage(ReviewRecipientsPage).prepareBarcodes()
  })

  it('should create barcode', () => {
    cy.task('stubCreateBarcode')
    Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    Page.verifyOnPage(GenerateBarcodeImagePage)
      .barcodeAddressImageExists()
      .imageDownloadButtonExists('Gage-Hewitt-A1234BC.png')
      .imageCopyButtonExists()
  })

  it('should show an error if create barcode fails', () => {
    cy.task('stubCreateBarcodeFailure')
    const page = Page.verifyOnPage(ChooseBarcodeOptionPage)
    page.continueToImageErrors().hasErrorContaining('error')
  })
})
