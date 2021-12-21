import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import ManualBarcodeEntryPage from './manualBarcodeEntry'
import barcodes from '../../mockApis/barcodes'

export default class ScanBarcodeResultPage extends Page {
  constructor() {
    super('scan-barcode-result')
    this.barcodeFieldIsFocussed()
  }

  barcodeFieldIsFocussed = () => {
    this.barcode().should('be.focused')
  }

  clickFurtherChecksNecessary = (): ScanBarcodeResultPage => {
    this.furtherChecksNecessaryLink().should('exist').click()
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  clickToGoToManualBarcodeEntryPage = (): ManualBarcodeEntryPage => {
    this.manualBarcodeEntryLink().click()
    return Page.verifyOnPage(ManualBarcodeEntryPage)
  }

  setBarcode = (value: string): ScanBarcodeResultPage => {
    if (value && value.length > 0) {
      this.barcode().type(value)
    } else {
      this.barcode().clear()
    }
    return Page.verifyOnPage(ScanBarcodeResultPage)
  }

  pressEnterInBarcodeField = () => {
    this.barcode().type('\n')
  }

  submitFormWithBarcodeThatFailsValidation = (): ScanBarcodeResultPage => {
    this.setBarcode(barcodes.INVALID_FORMAT_BARCODE)
    this.pressEnterInBarcodeField()
    return Page.verifyOnPage(ScanBarcodeResultPage)
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

  barcode = (): PageElement => cy.get('#barcode')

  furtherChecksNecessaryLink = (): PageElement => cy.get('#further-checks')

  manualBarcodeEntryLink = (): PageElement => cy.get('#manual-barcode-entry')
}
