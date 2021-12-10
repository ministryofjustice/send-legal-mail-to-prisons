import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'

context('Find Recipient Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
  })

  it('should redirect to Request List page if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient')

    Page.verifyOnPage(RequestLinkPage)
  })
})
