import Page, { PageElement } from '../page'

export default class ScanBarcodeResultPage extends Page {
  constructor() {
    super('scan-barcode-result')
    this.barcodeFieldIsFocussed()
  }

  barcodeFieldIsFocussed = () => {
    this.barcode().should('be.focused')
  }

  barcode = (): PageElement => cy.get('#barcode')
}
