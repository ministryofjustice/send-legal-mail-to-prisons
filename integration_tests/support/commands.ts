import RequestLinkPage from '../pages/link/requestLink'
import featureFlags from './featureFlags'
import RequestOneTimeCodePage from '../pages/one-time-code/requestOneTimeCode'
import EmailSentPage from '../pages/one-time-code/emailSent'
import Page from '../pages/page'
import FindRecipientByPrisonNumberPage from '../pages/barcode/findRecipientByPrisonNumber'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.task('stubGetPrisonRegister')
  cy.request(`/`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('signInAsLegalSender', () => {
  cy.task('stubAuthToken')
  cy.task('stubGetCjsmUserDetails')
  cy.task('stubGetPrisonRegister')

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
    const emailSentPage: EmailSentPage = RequestOneTimeCodePage.goToPage().submitFormWithValidEmailAddress(
      EmailSentPage,
      'valid@email.address.cjsm.net'
    )
    // Submit the one time code
    emailSentPage.submitFormWithValidOneTimeCode()
  }
})

Cypress.Commands.add('signInAsSmokeTestLegalSender', () => {
  let findRecipientPage: FindRecipientByPrisonNumberPage

  if (!featureFlags.isLsjOneTimeCodeAuthEnabled()) {
    // Sign in as the smoke test user using a magic link
    cy.visit(`${Cypress.env('LSJ_URL')}/link/request-link`)
    findRecipientPage = Page.verifyOnPage(RequestLinkPage).submitFormWithSmokeTestUser(
      Cypress.env('APP_SMOKETEST_LSJSECRET')
    )
  } else {
    // Sign in as the smoke test user using a One Time Code
    cy.visit(`${Cypress.env('LSJ_URL')}/oneTimeCode/request-code`)
    Page.verifyOnPage(RequestOneTimeCodePage).submitFormWithValidEmailAddress(
      FindRecipientByPrisonNumberPage,
      Cypress.env('APP_SMOKETEST_LSJSECRET')
    )
    findRecipientPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  // Regardless of how we signed in, reject cookies and hide the banner
  findRecipientPage.clickCookieAction(FindRecipientByPrisonNumberPage, 'reject')
  findRecipientPage.clickCookieAction(FindRecipientByPrisonNumberPage, 'hide')
})
