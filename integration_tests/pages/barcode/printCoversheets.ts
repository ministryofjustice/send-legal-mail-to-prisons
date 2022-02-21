/* eslint-disable import/no-cycle */
import Page from '../page'
import SelectEnvelopeSizePage from './selectEnvelopeSize'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'

export default class PrintCoversheetsPage extends Page {
  constructor() {
    super('print-coversheets')
  }

  downloadThePdfAgain = (): PrintCoversheetsPage => {
    this.downloadLink().then(link => {
      link.trigger('click')
    })
    return Page.verifyOnPage(PrintCoversheetsPage)
  }

  clickBrowserBackButton = (): FindRecipientByPrisonNumberPage => {
    cy.go(-1)
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  downloadLink = () => cy.get('#downloadPdf')

  static goToPage = (): PrintCoversheetsPage => SelectEnvelopeSizePage.goToPage().submitHavingSelectedDlEnvelopeSize()
}
