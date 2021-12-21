import Page, { PageElement } from '../page'

export default class ScanBarcodeResultPage extends Page {
  constructor() {
    super('scan-barcode-result')
    this.barcodeFieldIsFocussed()
  }

  barcodeFieldIsFocussed = () => {
    this.barcode().should('be.focused')
  }

  clickFurtherChecksNecessary = (): ScanBarcodeResultPage => {
    this.furtherChecksNecessaryLink().should('exist').click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  barcode = (): PageElement => cy.get('#barcode')

  furtherChecksNecessaryLink = (): PageElement => cy.get('#further-checks')
}
