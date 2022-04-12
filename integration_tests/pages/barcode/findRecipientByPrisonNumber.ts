/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import CreateNewContactByPrisonNumberPage from './createNewContactByPrisonNumber'
import FindRecipientByPrisonerNamePage from './findRecipientByPrisonerName'
import ReviewRecipientsPage from './reviewRecipients'

export default class FindRecipientByPrisonNumberPage extends Page {
  constructor() {
    super('find-recipient-by-prison-number')
  }

  prisonNumberFieldIsFocussed = () => {
    this.prisonNumberField().should('be.focused')
  }

  submitWithPrisonNumber = (prisonNumber): CreateNewContactByPrisonNumberPage => {
    this.prisonNumberField().clear().type(prisonNumber)
    this.submitButton().click()
    return Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
  }

  submitWithUnknownPrisonNumber = (prisonNumber = 'A1234BC'): CreateNewContactByPrisonNumberPage => {
    this.prisonNumberField().clear().type(prisonNumber)
    cy.task('stubGetContactNone')
    this.submitButton().click()
    return Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
  }

  submitWithKnownPrisonNumber = (): ReviewRecipientsPage => {
    this.prisonNumberField().clear().type('H4567IJ')
    cy.task('stubGetContactOne')
    this.submitButton().click()
    return Page.verifyOnPage(ReviewRecipientsPage)
  }

  submitWithInvalidPrisonNumber = (): FindRecipientByPrisonNumberPage => {
    this.prisonNumberField().clear().type('A 1234 BC')
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
    cy.signInAsLegalSender()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }
}
