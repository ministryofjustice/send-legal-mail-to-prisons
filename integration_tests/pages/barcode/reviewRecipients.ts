import Page, { PageElement } from '../page'

export default class ReviewRecipientsPage extends Page {
  constructor() {
    super('review-recipients')
  }

  createBarcodeButton = (): PageElement => cy.get('[data-qa=create-barcode-button]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }
}
