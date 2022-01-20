/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ReviewRecipientsPage from './reviewRecipients'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'

export default class CreateNewContactPage extends Page {
  constructor() {
    super('create-new-contact')
    this.prisonerNameFieldIsFocussed()
  }

  prisonerNameFieldIsFocussed = () => {
    this.prisonerNameField().should('be.focused')
  }

  submitWithValidValues = (): ReviewRecipientsPage => {
    this.enterAValidPrisonerName()
    this.typeAheadAValidPrison()
    return this.submitForm(ReviewRecipientsPage)
  }

  enterAValidPrisonerName = (): CreateNewContactPage => {
    this.prisonerNameField().clear()
    this.prisonerNameField().type('Gage Hewitt')
    return this
  }

  typeAheadAValidPrison = (): CreateNewContactPage => {
    this.clearPrisonField()
    this.prisonIdField().type('ashfield')
    this.pressEnterInPrisonIdField()
    return this
  }

  typeAheadAnInvalidPrison = (): CreateNewContactPage => {
    this.clearPrisonField()
    this.prisonIdField().type('not a valid prison')
    this.pressEnterInPrisonIdField()
    return this
  }

  clearPrisonField = (): CreateNewContactPage => {
    this.prisonIdField().clear()
    return this
  }

  pressEnterInPrisonIdField = () => {
    this.prisonIdField().type('\n')
  }

  submitForm<T>(T): T {
    this.submitButton().click()
    return Page.verifyOnPage(T)
  }

  hasPrisonerNameErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonerName-error').should('contain', partialMessage)
  }

  hasPrisonIdErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonId-error').should('contain', partialMessage)
  }

  prisonerNameField = (): PageElement => cy.get('#prisonerName')

  prisonIdField = (): PageElement => cy.get('#prisonId')

  submitButton = (): PageElement => cy.get('#create-new-contact-form button')

  static goToPage = (): CreateNewContactPage => FindRecipientByPrisonNumberPage.goToPage().submitWithValidPrisonNumber()
}
