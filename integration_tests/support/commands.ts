import RequestLinkPage from '../pages/link/requestLink'
import featureFlags from './featureFlags'
import RequestOneTimeCodePage from '../pages/one-time-code/requestOneTimeCode'
import EmailSentPage from '../pages/one-time-code/emailSent'
import Page from '../pages/page'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request(`/`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('signInAsLegalSender', () => {
  cy.task('stubAuthToken')
  cy.task('stubGetCjsmUserDetails')

  if (!featureFlags.isLsjOneTimeCodeAuthEnabled()) {
    // Sign in as LSJ with magic link
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    // Request a magic link and click it to sign in
    RequestLinkPage.goToPage().submitFormWithValidEmailAddress('valid@email.address.cjsm.net')
    cy.visit('/link/verify-link?secret=a-valid-secret')
  } else {
    // Sign in as LSJ with One Time Code
    cy.task('stubRequestOneTimeCode')
    cy.task('stubVerifyOneTimeCode')

    // Request a one time code - we dont need to know what it is, but we do need to have submitted the form on this page
    RequestOneTimeCodePage.goToPage().submitFormWithValidEmailAddress('valid@email.address.cjsm.net')
    // Submit the one time code
    const emailSentPage = Page.verifyOnPage(EmailSentPage)
    emailSentPage.submitFormWithValidOneTimeCode()
  }
})
