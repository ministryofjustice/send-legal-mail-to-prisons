import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'

context('Request Link', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should render request link page to unauthenticated user and reset cookie', () => {
    cy.setCookie('create_barcode_token', '... a barcode ...')
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage)

    cy.getCookie('create_barcode_token').should('not.exist')
  })

  it('html field validation should prevent form submission given invalid email address', () => {
    cy.visit('/link/request-link')
    let page = Page.verifyOnPage(RequestLinkPage)

    page.enterEmailAddress('an-Invalid-Email-Address')
    page.submitForm()

    page = Page.verifyOnPage(RequestLinkPage)
    page.emailField().then($input => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
        "Please include an '@' in the email address. 'an-Invalid-Email-Address' is missing an '@'."
      )
    })
    page.errorsList().should('not.exist')
  })

  it('should redisplay form with errors given form submitted with no email address', () => {
    cy.visit('/link/request-link')
    let page = Page.verifyOnPage(RequestLinkPage)

    page.enterEmailAddress('')
    page.submitForm()

    page = Page.verifyOnPage(RequestLinkPage)
    page.errorsList().should('exist').contains('Enter an email address')
  })

  it('should submit form given valid email address', () => {
    cy.visit('/link/request-link')
    const page = Page.verifyOnPage(RequestLinkPage)

    page.enterEmailAddress('valid@email.address')
    page.submitForm()

    const emailSentPage = Page.verifyOnPage(EmailSentPage)
    emailSentPage.successBanner().should('exist').contains(`We've sent a link to your email - valid@email.address`)
  })

  it('html field validation should prevent form submission given email sent page displayed and invalid email address entered', () => {
    cy.visit('/link/request-link')
    const page = Page.verifyOnPage(RequestLinkPage)
    page.enterEmailAddress('valid@email.address')
    page.submitForm()

    let emailSentPage = Page.verifyOnPage(EmailSentPage)
    emailSentPage.enterEmailAddress('not.valid.email.address')
    emailSentPage.submitForm()

    emailSentPage = Page.verifyOnPage(EmailSentPage)
    emailSentPage.emailField().then($input => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.eq(
        "Please include an '@' in the email address. 'not.valid.email.address' is missing an '@'."
      )
    })
  })

  it('should redisplay request link page given email sent page displayed and attempting to resubmit form with an empty email address', () => {
    cy.visit('/link/request-link')
    const page = Page.verifyOnPage(RequestLinkPage)
    page.enterEmailAddress('valid@email.address')
    page.submitForm()
    const emailSentPage = Page.verifyOnPage(EmailSentPage)
    emailSentPage.enterEmailAddress('')
    emailSentPage.submitForm()

    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    requestLinkPage.errorsList().should('exist').contains('Enter an email address')
  })
})
