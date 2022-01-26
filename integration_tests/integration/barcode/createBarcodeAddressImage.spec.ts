import Page from '../../pages/page'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'

context('Create Barcode Image', () => {
  beforeEach(() => {
    ChooseBarcodeOptionPage.goToPage()
  })

  it('should create barcode', () => {
    cy.task('stubCreateBarcode')
    Page.verifyOnPage(ChooseBarcodeOptionPage).continueToImage()
    Page.verifyOnPage(GenerateBarcodeImagePage)
      .barcodeAddressImageExists()
      .imageDownloadButtonExists(/Gage-Hewitt-A1234BC-\d{2}-\d{2}-\d{4}\.png/)
      .imageCopyButtonExists()
  })

  it('should show an error if create barcode fails', () => {
    cy.task('stubCreateBarcodeFailure')
    const page = Page.verifyOnPage(ChooseBarcodeOptionPage)
    page.continueToImageErrors().hasErrorContaining('error')
  })

  // TODO - the intent of the test is correct, but wiremock stubs will need creating once the barcode API is called with recipient details (SLM-99)
  // At the moment we cannot reliably tell wiremock to fail for the 2nd call
  it.skip('should show an error if creating the first barcode succeeds but subsequent barcodes fail', () => {
    cy.go(-1) // back to Review Recipients in order to add a 2nd recipient
    const reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)
    reviewRecipientsPage.addAnotherRecipient().submitWithValidPrisonNumber().submitWithValidValues().prepareBarcodes()

    const page = Page.verifyOnPage(ChooseBarcodeOptionPage)
    page.continueToImageErrors().hasErrorContaining('error generating the barcode')
  })
})
