import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import ReviewRecipientsPage from './reviewRecipients'

export default class EditContactDetails extends Page {
  constructor() {
    super('edit-contact')
  }

  hasName = (name: string): EditContactDetails => {
    this.prisonerNameField().should('have.value', name)
    return this
  }

  hasPrisonName = (prisonName: string): EditContactDetails => {
    this.prisonIdField().should('have.value', prisonName)
    return this
  }

  changeName = (newName: string): EditContactDetails => {
    this.prisonerNameField().clear().type(newName)
    return this
  }

  typeAheadAValidPrison = (prisonName = 'ashfield'): EditContactDetails => {
    this.clearPrisonField()
    this.prisonIdField().type(prisonName)
    this.pressEnterInPrisonIdField()
    return this
  }

  clearPrisonField = (): EditContactDetails => {
    this.prisonIdField().clear()
    return this
  }

  pressEnterInPrisonIdField = () => {
    this.prisonIdField().type('\n')
  }

  submit = (contactId: number): ReviewRecipientsPage => {
    cy.task('stubUpdateContact', contactId)
    this.submitButton().click()
    return Page.verifyOnPage(ReviewRecipientsPage)
  }

  submitWithError = (): EditContactDetails => {
    this.submitButton().click()
    return Page.verifyOnPage(EditContactDetails)
  }

  prisonerNameField = (): PageElement => cy.get('#prisonerName')

  prisonIdField = (): PageElement => cy.get('#prisonId')

  prisonNumberField = (): PageElement => cy.get('#prisonNumber')

  prisonerDobDayField = (): PageElement => cy.get('#dob-day')

  prisonerDobMonthField = (): PageElement => cy.get('#dob-month')

  prisonerDobYearField = (): PageElement => cy.get('#dob-year')

  submitButton = (): PageElement => cy.get('#edit-contact-form button')

  hasErrorContaining = (field: string, partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get(`#${field}-error`).should('contain', partialMessage)
  }

  static goToPage = (): EditContactDetails => {
    ReviewRecipientsPage.goToPage().editContact(1)
    return Page.verifyOnPage(EditContactDetails)
  }
}
