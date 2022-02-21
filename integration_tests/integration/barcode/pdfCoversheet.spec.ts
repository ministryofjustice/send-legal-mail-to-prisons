import Page from '../../pages/page'
import PrintCoversheetsPage from '../../pages/barcode/printCoversheets'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context('Print PDF coversheet', () => {
  let printCoversheetsPage: PrintCoversheetsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCreateBarcode')
    printCoversheetsPage = PrintCoversheetsPage.goToPage()
  })

  it('should allow the PDF to be downloaded again', () => {
    printCoversheetsPage.downloadThePdfAgain()
    Page.verifyOnPage(PrintCoversheetsPage)
  })

  it('should restart the journey if the user clicks the browser Back button', () => {
    printCoversheetsPage.clickBrowserBackButton()
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })
})
