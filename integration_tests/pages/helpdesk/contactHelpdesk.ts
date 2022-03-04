import Page, { PageElement } from '../page'
import ContactHelpdeskConfirmationPage from './contactHelpdeskConfirmation'

export default class ContactHelpdeskPage extends Page {
  constructor() {
    super('contact-helpdesk', { expectHelpdeskLink: false })
  }

  referringPageIs = (expectedPageId: string): ContactHelpdeskPage => {
    this.referringPageIdField().should('contain.value', expectedPageId)
    return this
  }

  submitFormWithValidValues<T>(T = ContactHelpdeskConfirmationPage): T {
    this.problemDetailField().clear().type('I had a problem with ....')
    this.nameField().clear().type('Mr A User')
    this.emailField().clear().type('a.user@email.com')
    return this.submitForm(T)
  }

  submitFormWithNoValues = (): ContactHelpdeskPage => {
    this.problemDetailField().clear()
    this.nameField().clear()
    this.emailField().clear()
    return this.submitForm(ContactHelpdeskPage)
  }

  submitForm<T>(T): T {
    this.submitButton().click()
    return Page.verifyOnPage(T)
  }

  hasErrorContaining = (partialMessage: string): ContactHelpdeskPage => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    return this
  }

  problemDetailField = (): PageElement => cy.get('#problemDetail')

  nameField = (): PageElement => cy.get('#name')

  emailField = (): PageElement => cy.get('#email')

  submitButton = (): PageElement => cy.get('button[data-qa=contact-helpdesk-button]')

  referringPageIdField = (): PageElement => cy.get('input[name=pageId')
}
