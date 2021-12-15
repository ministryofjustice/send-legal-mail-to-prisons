import Page from '../../pages/page'
import AuthorisationErrorPage from '../../pages/authorisationError'
import ManualBarcodeEntryPage from '../../pages/scan/manualBarcodeEntry'
import ReportManualBarcodeEntryProblem from '../../pages/scan/reportManualBarcodeEntryProblem'
import ScanBarcodeResultPage from '../../pages/scan/scanBarcodeResult'

context('Manual Barcode Entry Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  it('Logged in user with SLM_SCAN_BARCODE role can navigate to manual barcode entry page', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()

    cy.visit('/manually-enter-barcode')

    Page.verifyOnPage(ManualBarcodeEntryPage)
  })

  it('Logged in user with SLM_SECURITY_ANALYST role can not navigate to manual barcode entry page', () => {
    cy.task('stubSignInWithRole_SLM_SECURITY_ANALYST')
    cy.signIn()

    cy.visit('/manually-enter-barcode', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })

  it('Unauthenticated user can not navigate to manual barcode entry page', () => {
    // This is a terrible test - unauthenticated users get a 404 page rather than a 401 which seems to be an express thing
    // plus express returns content-type: text/plain for a 404 page (unless defined with a specific error route handler and view rendering)
    // which means cypress fails because it expects cy.visit calls to return text/html
    // TODO - implement 401 and 404 handlers with appropriate views; configure express to return a 401 for valid page routes when unauthenticated
    // and make this test better!
    // (also note our current /autherror handler returns a 401 - this perhaps should be a 403 ?
    cy.request({ url: '/manually-enter-barcode', failOnStatusCode: false }).its('status').should('equal', 404)
  })

  it('should render barcode results page given form submitted with barcode that verifies as OK', () => {
    cy.task('stubVerifyValidBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    const scanBarcodeResultPage: ScanBarcodeResultPage = manualBarcodeEntryPage.submitFormWithValidBarcode()

    scanBarcodeResultPage.hasMainHeading('Ready for final delivery')
  })

  it('should render barcode results page given form submitted with barcode that has been scanned before', () => {
    cy.task('stubVerifyDuplicateBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    const scanBarcodeResultPage: ScanBarcodeResultPage =
      manualBarcodeEntryPage.submitFormWithBarcodeThatHasBeenScannedPreviously()

    scanBarcodeResultPage.hasMainHeading('Carry out further checks')
  })

  it('should render barcode results page given form submitted with barcode that has been selected for a random check', () => {
    cy.task('stubVerifyRandomCheckBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    const scanBarcodeResultPage: ScanBarcodeResultPage =
      manualBarcodeEntryPage.submitFormWithBarcodeThatWillBeSelectedForARandomCheck()

    scanBarcodeResultPage.hasMainHeading('Item selected for a random check')
  })

  it('should render barcode results page given form submitted with barcode that has expired', () => {
    cy.task('stubVerifyExpiredBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    const scanBarcodeResultPage: ScanBarcodeResultPage = manualBarcodeEntryPage.submitFormWithBarcodeThatHasExpired()

    scanBarcodeResultPage.hasMainHeading('Carry out further checks')
  })

  it('should redisplay form with errors given form submitted with invalid barcode', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    manualBarcodeEntryPage.submitFormWithBarcodeThatFailsValidation()

    manualBarcodeEntryPage.hasErrorContaining('correct format')
  })

  it('should allow user to report problem when trying to manually enter a barcode', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/manually-enter-barcode')
    const manualBarcodeEntryPage = Page.verifyOnPage(ManualBarcodeEntryPage)

    manualBarcodeEntryPage.reportProblemEnteringBarcode()

    Page.verifyOnPage(ReportManualBarcodeEntryProblem)
  })
})
