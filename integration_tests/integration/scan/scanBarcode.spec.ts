import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import assertPageMeetsAccessibilityStandards from '../../support/accessibilityHelper'
import AuthorisationErrorPage from '../../pages/authorisationError'

context('Scan Barcode Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  afterEach('Rendered page should meet accessibility standards', () => {
    assertPageMeetsAccessibilityStandards()
  })

  it('Logged in user with SLM_SCAN_BARCODE role can navigate to scan barcode page', () => {
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()

    cy.visit('/scan-barcode')

    Page.verifyOnPage(ScanBarcodePage)
  })

  it('Logged in user with SLM_SECURITY_ANALYST role can not navigate to scan barcode page', () => {
    cy.task('stubSignInWithRole_SLM_SECURITY_ANALYST')
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
})
