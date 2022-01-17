import Page, { PageElement } from '../page'
import GenerateBarcodeImagePage from './generateBarcodeImage'

export default class ChooseBarcodeOptionPage extends Page {
  constructor() {
    super('choose-barcode-option')
  }

  continueToImage = (): GenerateBarcodeImagePage => {
    this.selectImage().check()
    return this.continue()
  }

  continue = (): GenerateBarcodeImagePage => {
    this.continueButton().click()
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  continueToImageErrors = (): ChooseBarcodeOptionPage => {
    this.selectImage().check()
    this.continueButton().click()
    return Page.verifyOnPage(ChooseBarcodeOptionPage)
  }

  selectImage = (): PageElement => cy.get('input#barcodeOption[value=image]')

  selectCoversheet = (): PageElement => cy.get('input#barcodeOption[value=coversheet]')

  continueButton = (): PageElement => cy.get('button[data-qa="continue-button"]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }
}
