import Page from '../../pages/page'
import assertPageMeetsAccessibilityStandards from '../../support/accessibilityHelper'
import AuthorisationErrorPage from '../../pages/authorisationError'

context('Report Manual Barcode Entry Problem Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  afterEach('Rendered page should meet accessibility standards', () => {
    assertPageMeetsAccessibilityStandards()
  })

  it('Logged in user with SLM_SECURITY_ANALYST role can not navigate to Report Manual Barcode Entry Problem page', () => {
    cy.task('stubSignInWithRole_SLM_SECURITY_ANALYST')
    cy.signIn()

    cy.visit('/manually-enter-barcode/report-problem', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })
})
