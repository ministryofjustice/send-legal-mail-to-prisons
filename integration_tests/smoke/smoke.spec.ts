import Page from '../pages/page'
import RequestLinkPage from '../pages/link/requestLink'

context('Smoke test', () => {
  it('should show request link page', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    requestLinkPage.submitFormWithSmokeTestUser(Cypress.env('APP_SMOKETEST_LSJSECRET'))
  })
})
