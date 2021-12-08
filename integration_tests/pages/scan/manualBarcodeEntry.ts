import Page, { PageElement } from '../page'

export default class ManualBarcodeEntryPage extends Page {
  constructor() {
    super('Enter the barcode number manually')
  }

  setBarcodeElement1 = (value: string): ManualBarcodeEntryPage => {
    if (value && value.length > 0) {
      this.barcodeElement1Field().type(value)
    } else {
      this.barcodeElement1Field().clear()
    }
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  setBarcodeElement2 = (value: string): ManualBarcodeEntryPage => {
    if (value && value.length > 0) {
      this.barcodeElement2Field().type(value)
    } else {
      this.barcodeElement2Field().clear()
    }
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  setBarcodeElement3 = (value: string): ManualBarcodeEntryPage => {
    if (value && value.length > 0) {
      this.barcodeElement3Field().type(value)
    } else {
      this.barcodeElement3Field().clear()
    }
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  submitFormWithInvalidValues = (): ManualBarcodeEntryPage => {
    this.submitButton().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  submitFormWithValidValues = (): ManualBarcodeEntryPage => {
    this.submitButton().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage) // TODO successful submission will redirect to a different page when we reach that story
  }

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    // Only barcode element 1 should have an error message
    cy.get('#barcodeElement1-error').should('contain', partialMessage)
    cy.get('#barcodeElement2-error').should('not.contain.text')
    cy.get('#barcodeElement3-error').should('not.contain.text')
    // But all individual barcode element fields should be highlighted as in error
    this.barcodeElement1Field().should('have.class', 'govuk-input--error')
    this.barcodeElement2Field().should('have.class', 'govuk-input--error')
    this.barcodeElement3Field().should('have.class', 'govuk-input--error')
  }

  barcodeElement1Field = (): PageElement => cy.get('#barcodeElement1')

  barcodeElement2Field = (): PageElement => cy.get('#barcodeElement2')

  barcodeElement3Field = (): PageElement => cy.get('#barcodeElement3')

  submitButton = (): PageElement => cy.get('button[data-qa="submit-barcode-button"]')
}
