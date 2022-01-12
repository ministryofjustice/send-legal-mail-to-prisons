import Page, { PageElement } from '../page'
import ReviewRecipientsPage from './reviewRecipients'

export default class CreateNewContactPage extends Page {
  constructor() {
    super('create-new-contact')
    this.prisonerNameFieldIsFocussed()
  }

  prisonerNameFieldIsFocussed = () => {
    this.prisonerNameField().should('be.focused')
  }

  submitWithValidValues = (): ReviewRecipientsPage => {
    this.prisonerNameField().type('Gage Hewitt')
    this.prisonIdField().type('kennet')
    this.pressEnterInPrisonIdField()
    this.submitButton().click()
    return Page.verifyOnPage(ReviewRecipientsPage)
  }

  pressEnterInPrisonIdField = () => {
    this.prisonIdField().type('\n')
  }

  prisonerNameField = (): PageElement => cy.get('#prisonerName')

  prisonIdField = (): PageElement => cy.get('#prisonId')

  submitButton = (): PageElement => cy.get('#create-new-contact-form button')
}
