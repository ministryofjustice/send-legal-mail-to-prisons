import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import ScanBarcodeResultPage from '../../pages/scan/scanBarcodeResult'
import ScanAnotherBarcodePage from '../../pages/scan/scanAnotherBarcode'

context('Mailroom Journey E2E', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.task('stubVerifyValidBarcode')
    cy.task('stubVerifyNotFoundBarcode')
    cy.task('stubVerifyRandomCheckBarcode')
  })

  it('should allow mailroom staff to perform all actions as part of their workflow', () => {
    // Sign in and navigate to the Scan Barcode Page
    cy.signIn()
    cy.visit('/scan-barcode')
    const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)

    // Scan a valid barcode and arrive on the results page
    let resultPage: ScanBarcodeResultPage = scanBarcodePage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // From the result page, click to scan another barcode, then scan another valid barcode
    let scanAnotherBarcodePage: ScanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    resultPage = scanAnotherBarcodePage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // Click the Further Checks link and arrive on the results page with appropriate content
    resultPage.clickFurtherChecksNecessary()
    resultPage.hasMainHeading('Item of concern: carry out further checks')

    // From the result page, click to scan another barcode, then scan another valid barcode
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    resultPage = scanAnotherBarcodePage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // From the result page, click to scan another barcode, then scan a barcode that is not recognised
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    resultPage = scanAnotherBarcodePage.submitFormWithBarcodeThatDoesNotExist()
    resultPage.hasMainHeading('Barcode not recognised: carry out further checks')

    // Click to scan another barcode then click to go to the manual barcode entry page to try entering if from there
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    let manualBarcodeEntryPage = scanAnotherBarcodePage.clickToGoToManualBarcodeEntryPage()
    resultPage = manualBarcodeEntryPage.submitFormWithBarcodeThatDoesNotExist()
    resultPage.hasMainHeading('Barcode not recognised: carry out further checks')

    // Click to scan another barcode then click to go to the manual barcode entry page and click the link that says we have a problem entering a barcode
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    manualBarcodeEntryPage = scanAnotherBarcodePage.clickToGoToManualBarcodeEntryPage()
    resultPage = manualBarcodeEntryPage.problemEnteringBarcode()
    resultPage.hasMainHeading(`Barcode doesn't scan: carry out further checks`)

    // From the result page, click to scan another barcode, then scan another valid barcode
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    resultPage = scanAnotherBarcodePage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // From the result page, click to scan another barcode, then scan a barcode that will result in a random check
    scanAnotherBarcodePage = resultPage.iWantToScanAnotherBarcode()
    resultPage = scanAnotherBarcodePage.submitFormWithBarcodeThatWillBeSelectedForARandomCheck()
    resultPage.hasMainHeading('Item selected for a random check')

    // Sign Out having done a good day's work
    resultPage.signOut()
  })
})
