import Page, { PageElement } from '../page'
import ReportManualBarcodeEntryProblem from './reportManualBarcodeEntryProblem'

export default class ManualBarcodeEntryPage extends Page {
  constructor() {
    super('Enter the barcode number manually')
  }

  setBarcode = (value: string): ManualBarcodeEntryPage => {
    if (value && value.length > 0) {
      this.barcode().type(value)
    } else {
      this.barcode().clear()
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
    cy.get('#barcode-error').should('contain', partialMessage)
    this.barcode().should('have.class', 'govuk-input--error')
  }

  reportProblemEnteringBarcode = (): ReportManualBarcodeEntryProblem => {
    this.reportProblemLink().click()
    return Page.verifyOnPage(ReportManualBarcodeEntryProblem)
  }

  barcode = (): PageElement => cy.get('#barcode')

  submitButton = (): PageElement => cy.get('button[data-qa="submit-barcode-button"]')

  reportProblemLink = (): PageElement => cy.get('#report-problem')
}
