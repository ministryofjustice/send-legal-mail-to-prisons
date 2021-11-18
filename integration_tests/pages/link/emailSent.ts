import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import RequestLinkPage from './requestLink'

export default class EmailSentPage extends Page {
  constructor() {
    super('Now check your emails')
  }

  submitFormWithValidEmailAddress = (email: string): EmailSentPage => {
    this.emailField().type(email)

    this.submitButton().click()
    return Page.verifyOnPage(EmailSentPage)
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

  submitFormThatFailsHtml5EmailFieldValidation = (email: string): EmailSentPage => {
    this.emailField().type(email)

    this.submitButton().click()
    return Page.verifyOnPage(EmailSentPage)
  }

  emailFieldHasHtml5ValidationMessage = (message: string): EmailSentPage => {
    this.emailField().then($input => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.eq(message)
    })
    return Page.verifyOnPage(EmailSentPage)
  }

  emailField = (): PageElement => cy.get('#email')

  submitButton = (): PageElement => cy.get('button[data-qa="request-link-button"]')

  successBanner = (): PageElement => cy.get('div.govuk-notification-banner--success')
}
