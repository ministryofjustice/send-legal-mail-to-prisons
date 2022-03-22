import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import ScanBarcodeResultPage from './scanBarcodeResult'
import barcodes from '../../mockApis/barcodes'
// eslint-disable-next-line import/no-cycle
import ManualBarcodeEntryPage from './manualBarcodeEntry'

export default class ScanAnotherBarcodePage extends Page {
  constructor() {
    super('scan-another-barcode')
    this.barcodeFieldIsFocussed()
  }

  barcodeFieldIsFocussed = () => {
    this.barcode().should('be.focused')
  }

  setBarcode = (value: string): ScanAnotherBarcodePage => {
    if (value && value.length > 0) {
      this.barcode().type(value)
    } else {
      this.barcode().clear()
    }
    return Page.verifyOnPage(ScanAnotherBarcodePage)
  }

  pressEnterInBarcodeField = () => {
    this.barcode().type('\n')
  }

  submitBarcode = (barcode: string): ScanBarcodeResultPage => {
    this.setBarcode(barcode).pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatFailsValidation = (): ScanAnotherBarcodePage => {
    this.setBarcode(barcodes.INVALID_FORMAT_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanAnotherBarcodePage)
  }

  submitFormWithValidBarcode = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.VALID_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatHasBeenScannedPreviously = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.PREVIOUSLY_SCANNED_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatWillBeSelectedForARandomCheck = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.BARCODE_SELECTED_FOR_RANDOM_CHECK)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatHasExpired = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.EXPIRED_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  submitFormWithBarcodeThatDoesNotExist = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.UNRECOGNISED_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  clickToGoToManualBarcodeEntryPage = (): ManualBarcodeEntryPage => {
    this.manualBarcodeEntryLink().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#barcode-error').should('contain', partialMessage)
    this.barcode().should('have.class', 'govuk-input--error')
  }

  barcode = (): PageElement => cy.get('#barcode')

  manualBarcodeEntryLink = (): PageElement => cy.get('#manual-barcode-entry')
}
