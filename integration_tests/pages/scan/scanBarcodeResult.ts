import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import ScanAnotherBarcodePage from './scanAnotherBarcode'

export default class ScanBarcodeResultPage extends Page {
  constructor() {
    super('scan-barcode-result')
  }

  clickFurtherChecksNecessary = (): ScanBarcodeResultPage => {
    this.furtherChecksNecessaryLink().should('exist').click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  iWantToScanAnotherBarcode = (): ScanAnotherBarcodePage => {
    this.scanAnotherBarcodeButton().click()
    return Page.verifyOnPage(ScanAnotherBarcodePage)
  }

  isSuccessOrRandomCheck = (): ScanBarcodeResultPage => {
    cy.get('h1')
      .invoke('text')
      .should('match', /(Ready|random)/i)
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  furtherChecksNecessaryLink = (): PageElement => cy.get('#further-checks')

  scanAnotherBarcodeButton = (): PageElement => cy.get('a[data-qa="scan-another-barcode"]')
}
