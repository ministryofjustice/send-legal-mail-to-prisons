import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import EmailSentPage from './emailSent'

export default class RequestOneTimeCodePage extends Page {
  constructor() {
    super('request-one-time-code')
  }

  submitFormWithValidEmailAddress = (email: string, expectNextPage = true): EmailSentPage | RequestOneTimeCodePage => {
    this.emailField().type(email)

    this.submitButton().click()
    return expectNextPage ? Page.verifyOnPage(EmailSentPage) : Page.verifyOnPage(RequestOneTimeCodePage)
  }

  submitFormWithInvalidEmailAddress = (email: string): RequestOneTimeCodePage => {
    if (!!email && email.length > 0) {
      this.emailField().type(email)
    } else {
      this.emailField().clear()
    }

    this.submitButton().click()
    return Page.verifyOnPage(RequestOneTimeCodePage)
  }

  emailField = (): PageElement => cy.get('#email')

  submitButton = (): PageElement => cy.get('button[data-qa="request-code-button"]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#email-error').should('contain', partialMessage)
  }

  static goToPage = (): RequestOneTimeCodePage => {
    cy.visit('/oneTimeCode/request-code')
    return Page.verifyOnPage(RequestOneTimeCodePage)
  }
}
