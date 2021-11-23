import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import assertPageMeetsAccessibilityStandards from '../../support/accessibilityHelper'

context('Find Recipient Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
  })

  afterEach('Rendered page should meet accessibility standards', () => {
    assertPageMeetsAccessibilityStandards()
  })

  it('should redirect to Request List page if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient')

    Page.verifyOnPage(RequestLinkPage)
  })
})
