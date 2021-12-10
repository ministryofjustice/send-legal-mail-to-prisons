import Page from '../../pages/page'
import AuthorisationErrorPage from '../../pages/authorisationError'

context('Report Manual Barcode Entry Problem Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  it('Logged in user with SLM_SECURITY_ANALYST role can not navigate to Report Manual Barcode Entry Problem page', () => {
    cy.task('stubSignInWithRole_SLM_SECURITY_ANALYST')
    cy.signIn()

    cy.visit('/manually-enter-barcode/report-problem', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })
})
