import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import AuthorisationErrorPage from '../../pages/authorisationError'
import ScanBarcodeResultPage from '../../pages/scan/scanBarcodeResult'

context('Scan Barcode Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  it('Logged in user with SLM_SCAN_BARCODE role can navigate to scan barcode page', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()

    cy.visit('/scan-barcode')

    Page.verifyOnPage(ScanBarcodePage)
  })

  it('Logged in user with SLM_ADMIN role can not navigate to scan barcode page', () => {
    cy.task('stubSignInWithRole_SLM_ADMIN')
    cy.signIn()

    cy.visit('/scan-barcode', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })

  it('Unauthenticated user can not navigate to scan barcode page', () => {
    // This is a terrible test - unauthenticated users get a 404 page rather than a 401 which seems to be an express thing
    // plus express returns content-type: text/plain for a 404 page (unless defined with a specific error route handler and view rendering)
    // which means cypress fails because it expects cy.visit calls to return text/html
    // TODO - implement 401 and 404 handlers with appropriate views; configure express to return a 401 for valid page routes when unauthenticated
    // and make this test better!
    // (also note our current /autherror handler returns a 401 - this perhaps should be a 403 ?
    cy.request({ url: '/scan-barcode', failOnStatusCode: false }).its('status').should('equal', 404)
  })

  it('should render the correct title in the header', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/scan-barcode')
    Page.verifyOnPage(ScanBarcodePage).hasHeaderTitle('Check Rule 39 mail')
  })

  it('should render barcode results page given form submitted with barcode that verifies as OK', () => {
    cy.task('stubVerifyValidBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/scan-barcode')
    const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)

    const scanBarcodeResultPage: ScanBarcodeResultPage = scanBarcodePage.submitFormWithValidBarcode()

    scanBarcodeResultPage.hasMainHeading('Ready for final delivery')
  })

  it('should render barcode results page given form submitted with barcode that has been scanned before', () => {
    cy.task('stubVerifyDuplicateBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/scan-barcode')
    const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)

    const scanBarcodeResultPage: ScanBarcodeResultPage =
      scanBarcodePage.submitFormWithBarcodeThatHasBeenScannedPreviously()

    scanBarcodeResultPage.hasMainHeading('Barcode already scanned: carry out further checks')
  })

  it('should render barcode results page given form submitted with barcode that cannot be found', () => {
    cy.task('stubVerifyNotFoundBarcode')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/scan-barcode')
    const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)

    const scanBarcodeResultPage: ScanBarcodeResultPage = scanBarcodePage.submitFormWithBarcodeThatDoesNotExist()

    scanBarcodeResultPage.hasMainHeading('Barcode not recognised: carry out further checks')
  })
})
