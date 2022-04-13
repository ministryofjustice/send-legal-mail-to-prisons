/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
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

  sendMoreLegalMail = (): FindRecipientByPrisonNumberPage => {
    this.sendMoreLegalMailLink().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  clickBrowserBackButton = (): FindRecipientByPrisonNumberPage => {
    cy.go(-1)
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  downloadLink = () => cy.get('#downloadPdf')

  sendMoreLegalMailLink = (): PageElement => cy.get('[data-qa=send-more-legal-mail]')

  smokeTestBarcode = (): PageElement => cy.get('[data-qa=smoke-test-barcode]').invoke('text')

  static goToPage = (): PrintCoversheetsPage => SelectEnvelopeSizePage.goToPage().submitHavingSelectedDlEnvelopeSize()
}
