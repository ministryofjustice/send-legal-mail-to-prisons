import Page from '../../pages/page'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactPage from '../../pages/barcode/createNewContact'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'

context('Create Barcode on Review Recipient Page', () => {
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
  })

  it('should create barcode', () => {
    cy.task('stubCreateBarcode')
    Page.verifyOnPage(ReviewRecipientsPage).createBarcodeButton().click()
    Page.verifyOnPage(GenerateBarcodeImagePage)
      .barcodeAddressImageExists()
      .imageDownloadButtonExists('John-Smith-A1234BC.png') // TODO SLM-67 this should be gage hewett
      .imageCopyButtonExists()
  })

  it.only('should show an error if create barcode fails', () => {
    cy.task('stubCreateBarcodeFailure')
    Page.verifyOnPage(ReviewRecipientsPage).createBarcodeButton().click()
    Page.verifyOnPage(ReviewRecipientsPage).hasErrorContaining('error')
  })
})
