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

  submitWithValidValues = (prisonerName = 'Gage Hewitt', prisonName = 'ashfield'): ReviewRecipientsPage => {
    this.enterAValidPrisonerName(prisonerName)
    this.typeAheadAValidPrison(prisonName)
    return this.submitForm(ReviewRecipientsPage)
  }

  enterAValidPrisonerName = (prisonerName = 'Gage Hewitt'): CreateNewContactPage => {
    this.prisonerNameField().clear()
    this.prisonerNameField().type(prisonerName)
    return this
  }

  typeAheadAValidPrison = (prisonName = 'ashfield'): CreateNewContactPage => {
    this.clearPrisonField()
    this.prisonIdField().type(prisonName)
    this.pressEnterInPrisonIdField()
    return this
  }

  typeAheadHMPValidPrison = (): CreateNewContactPage => {
    this.clearPrisonField()
    this.prisonIdField().type('hmp ashfield')
    this.pressEnterInPrisonIdField()
    return this
  }

  typeAheadAnInvalidPrison = (): CreateNewContactPage => {
    this.clearPrisonField()
    this.prisonIdField().type('invalid prison')
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
