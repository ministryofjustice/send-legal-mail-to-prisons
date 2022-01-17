import Page, { PageElement } from '../page'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'

export default class ReviewRecipientsPage extends Page {
  constructor() {
    super('review-recipients')
  }

  prepareBarcodes = (): ChooseBarcodeOptionPage => {
    this.prepareBarcodesButton().click()
    return Page.verifyOnPage(ChooseBarcodeOptionPage)
  }

  prepareBarcodesButton = (): PageElement => cy.get('[data-qa=prepare-barcodes-button]')
}
