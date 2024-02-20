/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import FindRecipientByPrisonerNamePage from './findRecipientByPrisonerName'
import ReviewRecipientsPage from './reviewRecipients'
import CreateNewContactByPrisonerNamePage from './createNewContactByPrisonerName'

export default class ChooseContactPage extends Page {
  constructor() {
    super('choose-contact')
  }

  submitForFirstContact = (): ReviewRecipientsPage => {
    this.selectFirstContact().check({ force: true })
    this.continueButton().click()
    return Page.verifyOnPage(ReviewRecipientsPage)
  }

  submitForNewContact = (): CreateNewContactByPrisonerNamePage => {
    this.selectNewContact().check({ force: true })
    this.continueButton().click()
    return Page.verifyOnPage(CreateNewContactByPrisonerNamePage)
  }

  selectFirstContact = (): PageElement => cy.get('input[name=contactId]:first')

  selectNewContact = (): PageElement => cy.get('input[name=contactId]:last')

  continueButton = (): PageElement => cy.get('button[data-qa="continue-button"]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }

  static goToPage = (): ChooseContactPage => {
    FindRecipientByPrisonerNamePage.goToPage().submitWithKnownPrisonerName()
    return Page.verifyOnPage(ChooseContactPage)
  }
}
