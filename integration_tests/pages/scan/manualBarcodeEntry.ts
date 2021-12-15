import Page, { PageElement } from '../page'
import ReportManualBarcodeEntryProblem from './reportManualBarcodeEntryProblem'
import ScanBarcodeResultPage from './scanBarcodeResult'

export default class ManualBarcodeEntryPage extends Page {
  constructor() {
    super('manually-enter-barcode')
  }

  setBarcode = (value: string): ManualBarcodeEntryPage => {
    if (value && value.length > 0) {
      this.barcode().type(value)
    } else {
      this.barcode().clear()
    }
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  submitFormWithBarcodeThatFailsValidation = (): ManualBarcodeEntryPage => {
    this.setBarcode('12345678')
    this.submitButton().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  submitFormWithValidBarcode = (): ScanBarcodeResultPage => {
    this.setBarcode('123456789012')
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatHasBeenScannedPreviously = (): ScanBarcodeResultPage => {
    this.setBarcode('999956789012')
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatWillBeSelectedForARandomCheck = (): ScanBarcodeResultPage => {
    this.setBarcode('888856789012')
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
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
