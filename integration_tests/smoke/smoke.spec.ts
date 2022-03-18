import Page from '../pages/page'
import RequestLinkPage from '../pages/link/requestLink'

context('Smoke test', () => {
  it('should show request link page', () => {
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage)
  })
})
