import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'

context('Link Email Sent Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should render email sent page without a sign out link', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address')

    emailSentPage.signOut().should('not.exist')
  })

  it('should submit form given valid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address')

    emailSentPage.submitFormWithValidEmailAddress('another.valid@email.address')

    emailSentPage
      .successBanner()
      .should('exist')
      .contains(`We've sent a link to your email - another.valid@email.address`)
  })

  it('html field validation should prevent form submission given email sent page displayed and invalid email address entered', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address')

    emailSentPage.submitFormThatFailsHtml5EmailFieldValidation('not.valid.email.address')

    emailSentPage.emailFieldHasHtml5ValidationMessage(
      "Please include an '@' in the email address. 'not.valid.email.address' is missing an '@'."
    )
  })

  it('should redisplay request link page given email sent page displayed and attempting to resubmit form with an empty email address', () => {
    cy.visit('/link/request-link')
    const page = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = page.submitFormWithValidEmailAddress('valid@email.address')

    const requestLinkPage = emailSentPage.submitFormWithInvalidEmailAddress('')

    requestLinkPage.errorsList().should('exist').contains('Enter an email address')
  })

  it('should redisplay request link page given email sent page displayed and attempting to resubmit form with an invalid email address', () => {
    cy.visit('/link/request-link')
    const page = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = page.submitFormWithValidEmailAddress('valid@email.address')

    const requestLinkPage = emailSentPage.submitFormWithInvalidEmailAddress('not.a.valid@email')

    requestLinkPage.errorsList().should('exist').contains('Enter a valid email address')
  })
})
