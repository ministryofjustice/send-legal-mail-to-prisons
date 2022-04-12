import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'
import featureFlags from '../../support/featureFlags'

if (!featureFlags.isLsjOneTimeCodeAuthEnabled()) {
  context('Link Email Sent Page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthToken')
      cy.task('stubRequestLink')
    })

    it('should render email sent page without a sign out link', () => {
      const requestLinkPage = RequestLinkPage.goToPage()
      const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address')

      emailSentPage.signOut().should('not.exist')
    })

    it('should display request a link page given link to retry email is clicked', () => {
      const requestLinkPage = RequestLinkPage.goToPage()
      const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address') as EmailSentPage

      emailSentPage.clickRequestSignInLink()
    })

    it('should redirect to request a link if user navigates to email sent without having requested a link first', () => {
      cy.visit('/link/email-sent')

      Page.verifyOnPage(RequestLinkPage)
    })
  })
}
