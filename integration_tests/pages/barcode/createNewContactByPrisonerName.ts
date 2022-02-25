/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ReviewRecipientsPage from './reviewRecipients'
import ChooseContactPage from './chooseContact'

export default class CreateNewContactByPrisonerNamePage extends Page {
  constructor() {
    super('create-new-contact-by-prisoner-name')
  }

  prisonerDobFieldIsFocussed = () => {
    this.prisonerDobDayField().should('be.focused')
    return this
  }

  prisonIdFieldIsFocussed = () => {
    this.prisonIdField().should('be.focused')
    return this
  }

  submitWithValidValues = (
    contactId = 1,
    prisonerDobDay = '1',
    prisonerDobMonth = '1',
    prisonerDobYear = '1990',
    prisonName = 'leeds'
  ): ReviewRecipientsPage => {
    cy.task('stubCreateContact', contactId)
    this.enterAValidPrisonerDay(prisonerDobDay)
    this.enterAValidPrisonerMonth(prisonerDobMonth)
    this.enterAValidPrisonerYear(prisonerDobYear)
    this.typeAheadAValidPrison(prisonName)
    return this.submitForm(ReviewRecipientsPage)
  }

  enterAValidPrisonerDay = (prisonerDobDay = '1'): CreateNewContactByPrisonerNamePage => {
    this.prisonerDobDayField().clear()
    this.prisonerDobDayField().type(prisonerDobDay)
    return this
  }

  enterAValidPrisonerMonth = (prisonerDobMonth = '1'): CreateNewContactByPrisonerNamePage => {
    this.prisonerDobMonthField().clear()
    this.prisonerDobMonthField().type(prisonerDobMonth)
    return this
  }

  enterAValidPrisonerYear = (prisonerDobYear = '1990'): CreateNewContactByPrisonerNamePage => {
    this.prisonerDobYearField().clear()
    this.prisonerDobYearField().type(prisonerDobYear)
    return this
  }

  typeAheadAValidPrison = (prisonName = 'ashfield'): CreateNewContactByPrisonerNamePage => {
    this.clearPrisonField()
    this.prisonIdField().type(prisonName)
    this.pressEnterInPrisonIdField()
    return this
  }

  typeAheadAnInvalidPrison = (): CreateNewContactByPrisonerNamePage => {
    this.clearPrisonField()
    this.prisonIdField().type('invalid prison')
    this.pressEnterInPrisonIdField()
    return this
  }

  clearPrisonField = (): CreateNewContactByPrisonerNamePage => {
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

  hasPrisonerDobErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonerDob-error').should('contain', partialMessage)
  }

  hasPrisonIdErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#prisonId-error').should('contain', partialMessage)
  }

  prisonerDobDayField = (): PageElement => cy.get('#prisonerDob-day')

  prisonerDobMonthField = (): PageElement => cy.get('#prisonerDob-month')

  prisonerDobYearField = (): PageElement => cy.get('#prisonerDob-year')

  prisonIdField = (): PageElement => cy.get('#prisonId')

  submitButton = (): PageElement => cy.get('#create-new-contact-form button')

  static goToPage = (): CreateNewContactByPrisonerNamePage => {
    ChooseContactPage.goToPage().submitForNewContact()
    return Page.verifyOnPage(CreateNewContactByPrisonerNamePage)
  }
}
