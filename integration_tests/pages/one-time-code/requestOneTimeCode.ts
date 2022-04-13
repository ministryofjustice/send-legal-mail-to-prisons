import Page, { PageElement } from '../page'

export default class RequestOneTimeCodePage extends Page {
  constructor() {
    super('request-one-time-code')
  }

  submitFormWithValidEmailAddress<T>(T, email: string): T {
    this.emailField().type(email)

    this.submitButton().click()
    return Page.verifyOnPage(T)
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
