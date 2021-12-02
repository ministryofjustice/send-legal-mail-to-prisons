import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import EmailSentPage from '../../pages/link/emailSent'
import assertPageMeetsAccessibilityStandards from '../../support/accessibilityHelper'

context('Link Email Sent Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
  })

  afterEach('Rendered page should meet accessibility standards', () => {
    assertPageMeetsAccessibilityStandards()
  })

  it('should render email sent page without a sign out link', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address')

    emailSentPage.signOut().should('not.exist')
  })

  it('should display request a link page given link to retry email is clicked', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const emailSentPage = requestLinkPage.submitFormWithValidEmailAddress('valid@email.address') as EmailSentPage

    emailSentPage.clickRequestSignInLink()
  })

  it('should redirect to request a link if user navigates to email sent without having requested a link first', () => {
    cy.visit('/link/email-sent')

    Page.verifyOnPage(RequestLinkPage)
  })
})
