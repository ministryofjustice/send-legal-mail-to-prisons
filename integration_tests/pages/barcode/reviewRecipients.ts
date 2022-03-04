/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'
import CreateNewContactByPrisonNumberPage from './createNewContactByPrisonNumber'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'
import EditContactDetails from './editContactDetails'

export default class ReviewRecipientsPage extends Page {
  constructor() {
    super('review-recipients')
  }

  prepareBarcodes = (): ChooseBarcodeOptionPage => {
    this.prepareBarcodesButton().click()
    return Page.verifyOnPage(ChooseBarcodeOptionPage)
  }

  addAnotherRecipient = (): FindRecipientByPrisonNumberPage => {
    this.addAnotherRecipientButton().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  removeRecipient = (recipientNumber: number): ReviewRecipientsPage => {
    // Get row `recipientNumber` from the table, then get its 5th td cell to click the link within it
    this.recipientsTableBodyRows()
      .eq(recipientNumber - 1)
      .find(`td:nth-of-type(4) a`)
      .click()
    return Page.verifyOnPage(ReviewRecipientsPage)
  }

  editContact = (recipientNumber: number): EditContactDetails => {
    // Get row `recipientNumber` from the table, then get its 4th td cell to click the link within it
    cy.task('stubGetContact', 1)
    this.recipientsTableBodyRows()
      .eq(recipientNumber - 1)
      .find(`td:nth-of-type(3) a`)
      .click()
    return Page.verifyOnPage(EditContactDetails)
  }

  hasRecipientNamesExactly = (...expectedPrisonerNames: Array<string>) => {
    this.recipientsTableBodyRows()
      .should('have.length', expectedPrisonerNames.length)
      .find('th')
      .each(prisonerNameCell => {
        expect(expectedPrisonerNames).contains(prisonerNameCell.text())
      })
  }

  hasPrisonNamesExactly = (...expectedPrisonNames: Array<string>) => {
    this.recipientsTableBodyRows()
      .should('have.length', expectedPrisonNames.length)
      .find('td:nth-of-type(2)')
      .each(prisonNameCell => {
        expect(expectedPrisonNames).contains(prisonNameCell.text())
      })
  }

  hasNoRecipients = (): ReviewRecipientsPage => {
    this.recipientsTable().should('not.exist')
    return this
  }

  recipientsTable = (): PageElement => cy.get('table[data-qa=recipients-table]')

  recipientsTableBodyRows = (): PageElement => this.recipientsTable().find('.govuk-table__body tr')

  addAnotherRecipientButton = (): PageElement => cy.get('[data-qa=add-another-recipient]')

  prepareBarcodesButton = (): PageElement => cy.get('[data-qa=prepare-barcodes-button]')

  static goToPage = (): ReviewRecipientsPage => CreateNewContactByPrisonNumberPage.goToPage().submitWithValidValues()
}
