import Page from '../../pages/page'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context('Create Barcode Image', () => {
  beforeEach(() => {
    cy.task('reset')
    ChooseBarcodeOptionPage.goToPage()
  })

  it('should create barcode', () => {
    cy.task('stubCreateBarcode')
    Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    Page.verifyOnPage(GenerateBarcodeImagePage)
      .barcodeAddressImageExists()
      .imageDownloadButtonExists(/SendLegalMail-Gage-Hewitt-\d{4}-\d{2}-\d{2}\.png/)
      .imageCopyButtonExists()
  })

  it('should create barcode and click the copy button', () => {
    cy.task('stubCreateBarcode')
    Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    const generateBarcodeImagePage = Page.verifyOnPage(GenerateBarcodeImagePage)

    generateBarcodeImagePage.clickCopyBarcodeButton()

    generateBarcodeImagePage.imageCopyBarcodeFeedbackContainerIsVisible()
  })

  it('should show an error if create barcode fails', () => {
    cy.task('stubCreateBarcodeFailure')
    const page = Page.verifyOnPage(ChooseBarcodeOptionPage)
    page.continueToImageErrors().hasErrorContaining('error')
  })

  it('should show an error if creating the first barcode succeeds but subsequent barcodes fail', () => {
    cy.task('stubCreateBarcode', 'Gage Hewitt')
    cy.task('stubCreateBarcodeFailure', 'Arry Ardnut')
    cy.go(-1) // back to Review Recipients in order to add a 2nd recipient
    const reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)
    reviewRecipientsPage
      .addAnotherRecipient()
      .submitWithUnknownPrisonNumber()
      .submitWithValidValues(2, 'Arry Ardnut')
      .prepareBarcodes()

    const page = Page.verifyOnPage(ChooseBarcodeOptionPage)
    page.continueToImageErrors().hasErrorContaining('error generating the barcode')
  })

  it('should restart the journey if the user chooses to send more legal mail on the barcodes screen', () => {
    cy.task('stubCreateBarcode')
    const generateBarcodeImagePage = Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    generateBarcodeImagePage.sendMoreLegalMail()
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should restart the journey if the user clicks the browser Back button', () => {
    cy.task('stubCreateBarcode')
    const generateBarcodeImagePage = Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    generateBarcodeImagePage.clickBrowserBackButton()
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })
})
