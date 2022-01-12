import Page, { PageElement } from '../page'
import CreateNewContactPage from './createNewContact'

export default class FindRecipientByPrisonNumberPage extends Page {
  constructor() {
    super('find-recipient-by-prison-number')
    this.prisonNumberFieldIsFocussed()
  }

  prisonNumberFieldIsFocussed = () => {
    this.prisonNumberField().should('be.focused')
  }

  submitWithValidPrisonNumber = (): CreateNewContactPage => {
    this.prisonNumberField().type('A1234BC')
    this.submitButton().click()
    return Page.verifyOnPage(CreateNewContactPage)
  }

  submitWithInvalidPrisonNumber = (): FindRecipientByPrisonNumberPage => {
    this.prisonNumberField().type('A 1234 BC')
    this.submitButton().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  prisonNumberField = (): PageElement => cy.get('#prisonNumber')

  submitButton = (): PageElement => cy.get('#find-recipient-by-prison-number-form button')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonNumber-error').should('contain', partialMessage)
  }
}
