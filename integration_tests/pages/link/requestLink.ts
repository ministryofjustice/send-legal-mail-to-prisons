import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import EmailSentPage from './emailSent'

export default class RequestLinkPage extends Page {
  constructor() {
    super('request-link')
  }

  submitFormWithValidEmailAddress = (email: string, expectNextPage = true): EmailSentPage | RequestLinkPage => {
    this.emailField().type(email)

    this.submitButton().click()
    return expectNextPage ? Page.verifyOnPage(EmailSentPage) : Page.verifyOnPage(RequestLinkPage)
  }

  submitFormWithInvalidEmailAddress = (email: string): RequestLinkPage => {
    if (!!email && email.length > 0) {
      this.emailField().type(email)
    } else {
      this.emailField().clear()
    }

    this.submitButton().click()
    return Page.verifyOnPage(RequestLinkPage)
  }

  emailField = (): PageElement => cy.get('#email')

  submitButton = (): PageElement => cy.get('button[data-qa="request-link-button"]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#email-error').should('contain', partialMessage)
  }
}
