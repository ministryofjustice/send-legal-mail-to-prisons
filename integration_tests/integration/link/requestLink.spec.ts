import { skipOn } from '@cypress/skip-test'
import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import featureFlags from '../../support/featureFlags'

skipOn(featureFlags.isLsjOneTimeCodeAuthEnabled(), () =>
  context('Request Link Page', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthToken')
      cy.task('stubRequestLink')
    })

    it('should render the correct title in the header', () => {
      RequestLinkPage.goToPage().hasHeaderTitle('Send legal mail to prisons')
    })

    it('should render request link page without a sign out link', () => {
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.signOut().should('not.exist')
    })

    it('should submit form given valid email address', () => {
      const requestLinkPage = RequestLinkPage.goToPage()

      const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress(
        'valid@email.address.cjsm.net'
      ) as EmailSentPage

      emailSentPage.successBanner().should('contain', `We've sent a link`)
    })

    it('should redisplay form with errors given form submitted with no email address', () => {
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.submitFormWithInvalidEmailAddress('')

      requestLinkPage.hasErrorContaining('email address')
    })

    it('should redisplay form with errors given form submitted with invalid email address', () => {
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.submitFormWithInvalidEmailAddress('not.a.valid@email')

      requestLinkPage.hasErrorContaining('format')
    })

    it('should redisplay form with errors given form submitted with non cjsm email address', () => {
      cy.task('stubRequestLinkNonCjsmEmailFailure')
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.submitFormWithInvalidEmailAddress('valid@email.address')

      requestLinkPage.hasErrorContaining('format')
    })

    it('should redisplay form with errors given form submitted with an email that is too long', () => {
      cy.task('stubRequestLinkEmailTooLong')
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.submitFormWithInvalidEmailAddress('valid@email.address')

      requestLinkPage.hasErrorContaining('format')
    })

    it('should redisplay form with errors given send email link service fails', () => {
      cy.task('stubRequestLinkFailure')
      const requestLinkPage = RequestLinkPage.goToPage()

      requestLinkPage.submitFormWithValidEmailAddress('valid@email.address', false)

      requestLinkPage.hasErrorContaining('request a new')
    })

    it('should redirect to Find Recipient page if already signed in', () => {
      cy.signInAsLegalSender()
      Page.verifyOnPage(FindRecipientByPrisonNumberPage)

      cy.visit('/link/request-link')
      Page.verifyOnPage(FindRecipientByPrisonNumberPage)
    })
  })
)
