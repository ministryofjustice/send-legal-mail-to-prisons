import Page, { PageElement } from '../page'

export default class EmailSentPage extends Page {
  constructor() {
    super('Now check your emails')
  }

  enterEmailAddress = (email: string): EmailSentPage => {
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

  successBanner = (): PageElement => cy.get('div.govuk-notification-banner--success')
}
