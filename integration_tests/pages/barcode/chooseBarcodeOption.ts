/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import GenerateBarcodeImagePage from './generateBarcodeImage'
import SelectEnvelopeSizePage from './selectEnvelopeSize'
import ReviewRecipientsPage from './reviewRecipients'

export default class ChooseBarcodeOptionPage extends Page {
  constructor() {
    super('choose-barcode-option')
  }

  continueToImage = (): GenerateBarcodeImagePage => {
    this.selectImage().check()
    this.continueButton().click()
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  continueToCoversheet = (): SelectEnvelopeSizePage => {
    this.selectCoversheet().check()
    this.continueButton().click()
    return Page.verifyOnPage(SelectEnvelopeSizePage)
  }

  continueToImageErrors = (): ChooseBarcodeOptionPage => {
    this.selectImage().check()
    this.continueButton().click()
    return Page.verifyOnPage(ChooseBarcodeOptionPage)
  }

  selectImage = (): PageElement => cy.get('input[name=barcodeOption][value=image]')

  selectCoversheet = (): PageElement => cy.get('input[name=barcodeOption][value=coversheet]')

  continueButton = (): PageElement => cy.get('button[data-qa="continue-button"]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }

  static goToPage = (): ChooseBarcodeOptionPage => ReviewRecipientsPage.goToPage().prepareBarcodes()
}
