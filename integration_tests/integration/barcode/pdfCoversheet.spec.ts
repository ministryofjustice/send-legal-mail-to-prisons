import Page from '../../pages/page'
import PrintCoversheetsPage from '../../pages/barcode/printCoversheets'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context.only('Print PDF coversheet', () => {
  let printCoversheetsPage: PrintCoversheetsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCreateBarcode')
    printCoversheetsPage = PrintCoversheetsPage.goToPage()
  })

  it('should allow the PDF to be downloaded', () => {
    printCoversheetsPage.downloadThePdf()
    Page.verifyOnPage(PrintCoversheetsPage)
  })

  it('should restart the journey if the user clicks the browser Back button', () => {
    printCoversheetsPage.clickBrowserBackButton()
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should restart the journey if the user chooses to send more legal mail on the PDF screen', () => {
    printCoversheetsPage.sendMoreLegalMail()
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })
})
