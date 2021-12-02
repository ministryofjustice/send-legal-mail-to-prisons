import Page, { PageElement } from './page'
import ManualBarcodeEntryPage from './scan/manualBarcodeEntry'

export default class IndexPage extends Page {
  constructor() {
    super('Send Legal Mail')
  }

  containsTile(tileTitle: string): IndexPage {
    this.tilesContainer().should('contain', tileTitle)
    return Page.verifyOnPage(IndexPage)
  }

  doesNotContainTile(tileTitle: string): IndexPage {
    this.tilesContainer().should('not.contain', tileTitle)
    return Page.verifyOnPage(IndexPage)
  }

  clickScanBarcodeTile(): ManualBarcodeEntryPage {
    this.tilesContainer().find('div.card[data-test=scan-barcode] a').click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  tilesContainer = (): PageElement => cy.get('ul.card-group')
}
