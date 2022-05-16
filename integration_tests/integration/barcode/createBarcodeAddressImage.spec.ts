import Page from '../../pages/page'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'

context('Create Barcode Image', () => {
  beforeEach(() => {
    cy.task('reset')
    ChooseBarcodeOptionPage.goToPage()
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
})
