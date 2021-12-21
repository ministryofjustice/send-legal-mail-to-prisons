import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import ScanBarcodeResultPage from '../../pages/scan/scanBarcodeResult'

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

    // From the result page, scan another valid barcode
    resultPage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // Click the Further Checks link and arrive on the results page with appropriate content
    resultPage.clickFurtherChecksNecessary()
    resultPage.hasMainHeading('Carry out further checks')

    // From the result page, scan another valid barcode
    resultPage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // Scan a barcode that is not recognised
    resultPage.submitFormWithBarcodeThatDoesNotExist()
    resultPage.hasMainHeading('Carry out further checks')

    // Go to the manual barcode entry page to try entering if from there
    let manualBarcodeEntryPage = resultPage.clickToGoToManualBarcodeEntryPage()
    resultPage = manualBarcodeEntryPage.submitFormWithBarcodeThatDoesNotExist()
    resultPage.hasMainHeading('Carry out further checks')

    // Go back to the manual barcode entry page and click the link that says we have a problem entering a barcode
    manualBarcodeEntryPage = resultPage.clickToGoToManualBarcodeEntryPage()
    resultPage = manualBarcodeEntryPage.problemEnteringBarcode()
    resultPage.hasMainHeading('Carry out further checks')

    // From the result page, scan another valid barcode
    resultPage.submitFormWithValidBarcode()
    resultPage.hasMainHeading('Ready for final delivery')

    // Scan a barcode that will result in a random check
    resultPage.submitFormWithBarcodeThatWillBeSelectedForARandomCheck()
    resultPage.hasMainHeading('Item selected for a random check')

    // Sign Out having done a good day's work
    resultPage.signOut()
  })
})
