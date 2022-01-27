/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'
import CreateNewContactByPrisonerNamePage from './createNewContactByPrisonerName'

export default class FindRecipientByPrisonerNamePage extends Page {
  constructor() {
    super('find-recipient-by-prisoner-name')
  }

  prisonerNameFieldIsFocussed = () => {
    this.prisonerNameField().should('be.focused')
  }

  submitWithValidPrisonerName = (prisonerName = 'John Smith'): CreateNewContactByPrisonerNamePage => {
    this.prisonerNameField().clear().type(prisonerName)
    this.submitButton().click()
    return Page.verifyOnPage(CreateNewContactByPrisonerNamePage)
  }

  submitWithInvalidPrisonerName = (): FindRecipientByPrisonerNamePage => {
    this.prisonerNameField().clear()
    this.submitButton().click()
    return Page.verifyOnPage(FindRecipientByPrisonerNamePage)
  }

  prisonerNameField = (): PageElement => cy.get('#prisonerName')

  submitButton = (): PageElement => cy.get('#find-recipient-by-prisoner-name-form button')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonerName-error').should('contain', partialMessage)
  }

  static goToPage = (): FindRecipientByPrisonerNamePage =>
    FindRecipientByPrisonNumberPage.goToPage().goToByPrisonerName()
}
