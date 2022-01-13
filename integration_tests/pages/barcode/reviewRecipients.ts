import Page, { PageElement } from '../page'

export default class ReviewRecipientsPage extends Page {
  constructor() {
    super('review-recipients')
  }

  createBarcodeButton = (): PageElement => cy.get('[data-qa=create-barcode-button]')
}
