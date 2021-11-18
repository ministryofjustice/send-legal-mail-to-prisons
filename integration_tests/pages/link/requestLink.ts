import Page, { PageElement } from '../page'

export default class RequestLinkPage extends Page {
  constructor() {
    super('Request a link to log in')
  }

  enterEmailAddress = (email: string): RequestLinkPage => {
    if (!!email && email.length > 0) {
      this.emailField().type(email)
    } else {
      this.emailField().clear()
    }
    return this
  }

  submitForm = (): void => {
    this.submitButton().click()
  }

  emailField = (): PageElement => cy.get('#email')

  submitButton = (): PageElement => cy.get('button[data-qa="request-link-button"]')
}
