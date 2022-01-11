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

  furtherChecksNecessaryLink = (): PageElement => cy.get('#further-checks')

  scanAnotherBarcodeButton = (): PageElement => cy.get('a[data-qa="scan-another-barcode"]')
}
