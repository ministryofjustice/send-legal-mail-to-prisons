import Page, { PageElement } from '../page'
import ScanBarcodePage from '../scan/scanBarcode'

export default class IndexPage extends Page {
  constructor() {
    super('index-page')
  }

  clickAppLink = (): ScanBarcodePage => {
    this.appLink().click()
    return Page.verifyOnPage(ScanBarcodePage)
  }

  appLink = (): PageElement => cy.get('div[data-test=scan-barcode]').find('a')
}
