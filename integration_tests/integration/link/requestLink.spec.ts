import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context('Request Link Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
  })

  it('should render the correct title in the header', () => {
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage).hasHeaderTitle('Send legal mail to prisons')
  })

  it('should render request link page without a sign out link', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.signOut().should('not.exist')
  })

  it('should submit form given valid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress(
      'valid@email.address.cjsm.net'
    ) as EmailSentPage

    emailSentPage.successBanner().should('contain', `We've sent a link`)
  })

  it('should redisplay form with errors given form submitted with no email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('')

    requestLinkPage.hasErrorContaining('email address')
  })

  it('should redisplay form with errors given form submitted with invalid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('not.a.valid@email')

    requestLinkPage.hasErrorContaining('format')
  })

  it('should redisplay form with errors given form submitted with non cjsm email address', () => {
    cy.task('stubRequestLinkNonCjsmEmailFailure')
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('valid@email.address')

    requestLinkPage.hasErrorContaining('format')
  })

  it('should redisplay form with errors given form submitted with an email that is too long', () => {
    cy.task('stubRequestLinkEmailTooLong')
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('valid@email.address')

    requestLinkPage.hasErrorContaining('format')
  })

  it('should redisplay form with errors given send email link service fails', () => {
    cy.task('stubRequestLinkFailure')
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithValidEmailAddress('valid@email.address', false)

    requestLinkPage.hasErrorContaining('request a new')
  })

  it('should redirect to Find Recipient page if already signed in', () => {
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    cy.visit('/link/request-link')
    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })
})
