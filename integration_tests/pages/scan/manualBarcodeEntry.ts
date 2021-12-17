import Page, { PageElement } from '../page'
import ReportManualBarcodeEntryProblem from './reportManualBarcodeEntryProblem'
import ScanBarcodeResultPage from './scanBarcodeResult'
import barcodes from '../../mockApis/barcodes'

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
    this.setBarcode(barcodes.INVALID_FORMAT_BARCODE)
    this.submitButton().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  submitFormWithValidBarcode = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.VALID_BARCODE)
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatHasBeenScannedPreviously = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.PREVIOUSLY_SCANNED_BARCODE)
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatWillBeSelectedForARandomCheck = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.BARCODE_SELECTED_FOR_RANDOM_CHECK)
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatHasExpired = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.EXPIRED_BARCODE)
    this.submitButton().click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatDoesNotExist = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.UNRECOGNISED_BARCODE)
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
