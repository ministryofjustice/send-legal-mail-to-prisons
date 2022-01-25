/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import CreateNewContactByPrisonNumberPage from './createNewContactByPrisonNumber'
import FindRecipientByPrisonerNamePage from './findRecipientByPrisonerName'

export default class FindRecipientByPrisonNumberPage extends Page {
  constructor() {
    super('find-recipient-by-prison-number')
    this.prisonNumberFieldIsFocussed()
  }

  prisonNumberFieldIsFocussed = () => {
    this.prisonNumberField().should('be.focused')
  }

  submitWithValidPrisonNumber = (prisonNumber = 'A1234BC'): CreateNewContactByPrisonNumberPage => {
    this.prisonNumberField().type(prisonNumber)
    this.submitButton().click()
    return Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
  }

  submitWithInvalidPrisonNumber = (): FindRecipientByPrisonNumberPage => {
    this.prisonNumberField().type('A 1234 BC')
    this.submitButton().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  goToByPrisonerName = (): FindRecipientByPrisonerNamePage => {
    this.byPrisonerNameLink().click()
    return Page.verifyOnPage(FindRecipientByPrisonerNamePage)
  }

  prisonNumberField = (): PageElement => cy.get('#prisonNumber')

  byPrisonerNameLink = (): PageElement => cy.get('a[data-qa=by-prisoner-name-link]')

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
