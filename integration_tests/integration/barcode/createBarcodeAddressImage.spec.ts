import Page from '../../pages/page'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'

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
})
