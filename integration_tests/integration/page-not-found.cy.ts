import FindRecipientByPrisonNumberPage from '../pages/barcode/findRecipientByPrisonNumber'
import Error404Page from '../pages/error404'
import Page from '../pages/page'
import RequestOneTimeCodePage from '../pages/one-time-code/requestOneTimeCode'

context('404 Page Not Found', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  describe('Legal Sender user', () => {
    it(`should show the 'page not found' page when authenticated as a legal sender and navigating to a non existent SLM url`, () => {
      FindRecipientByPrisonNumberPage.goToPage()

      cy.visit('/barcode/find-recipient-by-inside-leg-measurement', { failOnStatusCode: false })

      Page.verifyOnPage(Error404Page)
    })

    it(`should redirect to the OTC sign in page when not authenticated and navigating to a non existent SLM url`, () => {
      cy.visit('/barcode/find-recipient-by-inside-leg-measurement', { failOnStatusCode: false })

      Page.verifyOnPage(RequestOneTimeCodePage)
    })
  })
})
