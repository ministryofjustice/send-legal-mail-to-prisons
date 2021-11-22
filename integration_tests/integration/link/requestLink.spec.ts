import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'

context('Request Link Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
  })

  it('should render request link page to unauthenticated user and reset cookie', () => {
    cy.setCookie('create_barcode_token', '... a barcode ...')
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage)

    cy.getCookie('create_barcode_token').should('not.exist')
  })

  it('should render request link page without a sign out link', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.signOut().should('not.exist')
  })

  it('should submit form given valid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address') as EmailSentPage

    emailSentPage.successBanner().should('exist').contains(`We've sent a link to your email - valid@email.address`)
  })

  it('html field validation should prevent form submission given invalid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormThatFailsHtml5EmailFieldValidation('an-Invalid-Email-Address')

    requestLinkPage.emailFieldHasHtml5ValidationMessage(
      "Please include an '@' in the email address. 'an-Invalid-Email-Address' is missing an '@'."
    )
    requestLinkPage.errorsList().should('not.exist')
  })

  it('should redisplay form with errors given form submitted with no email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('')

    requestLinkPage.errorsList().should('exist').contains('Enter an email address')
  })

  it('should redisplay form with errors given form submitted with invalid email address', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithInvalidEmailAddress('not.a.valid@email')

    requestLinkPage.errorsList().should('exist').contains('Enter a valid email address')
  })

  it('should redisplay form with errors given send email link service fails', () => {
    cy.task('stubRequestLinkFailure')
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    requestLinkPage.submitFormWithValidEmailAddress('valid@email.address', false)

    requestLinkPage.errorsList().should('exist').contains('There was an error generating your sign in link')
  })
})
