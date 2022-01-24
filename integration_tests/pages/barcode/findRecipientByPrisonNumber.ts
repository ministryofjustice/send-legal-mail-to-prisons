/* eslint-disable import/no-cycle */
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

  submitWithValidPrisonNumber = (prisonNumber = 'A1234BC'): CreateNewContactPage => {
    this.prisonNumberField().type(prisonNumber)
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

  static goToPage = (): FindRecipientByPrisonNumberPage => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubGetPrisonRegister')
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }
}
