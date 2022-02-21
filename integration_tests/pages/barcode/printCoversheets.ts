/* eslint-disable import/no-cycle */
import Page from '../page'
import SelectEnvelopeSizePage from './selectEnvelopeSize'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'

export default class PrintCoversheetsPage extends Page {
  constructor() {
    super('print-coversheets')
  }

  clickBrowserBackButton = (): FindRecipientByPrisonNumberPage => {
    cy.go(-1)
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  static goToPage = (): PrintCoversheetsPage => SelectEnvelopeSizePage.goToPage().submitHavingSelectedDlEnvelopeSize()
}
