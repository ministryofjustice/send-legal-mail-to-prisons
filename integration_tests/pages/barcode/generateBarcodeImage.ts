/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'
import FindRecipientByPrisonNumberPage from './findRecipientByPrisonNumber'

export default class GenerateBarcodeImagePage extends Page {
  constructor() {
    super('generate-barcode-image')
    this.imageCopyBarcodeFeedbackContainerIsNotVisible()
  }

  barcodeAddressImageExists = (): GenerateBarcodeImagePage => {
    this.barcodeAddressImage().should('exist')
    return this
  }

  imageDownloadButtonExists = (downloadFileName: RegExp): GenerateBarcodeImagePage => {
    const button = this.imageDownloadButton()
    button.should('exist')
    button.invoke('attr', 'download').should('match', downloadFileName)
    return this
  }

  imageCopyButtonExists = (): GenerateBarcodeImagePage => {
    this.imageCopyButton().should('exist')
    return this
  }

  clickCopyBarcodeButton = (): GenerateBarcodeImagePage => {
    this.imageCopyButton().click()
    return this
  }

  imageCopyBarcodeFeedbackContainerIsNotVisible = (): GenerateBarcodeImagePage => {
    this.imageCopyBarcodeFeedbackContainer().should('exist').and('not.be.visible')
    return this
  }

  imageCopyBarcodeFeedbackContainerIsVisible = (): GenerateBarcodeImagePage => {
    this.imageCopyBarcodeFeedbackContainer().should('be.visible').and('contain.text', 'Copied barcode')
    return this
  }

  clickBrowserBackButton = (): FindRecipientByPrisonNumberPage => {
    cy.go(-1)
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  sendMoreLegalMail = (): FindRecipientByPrisonNumberPage => {
    this.sendMoreLegalMailLink().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  barcodeAddressImage = (): PageElement => cy.get('img.barcode-address-image:first')

  imageDownloadButton = (): PageElement => cy.get('[data-qa=download-image-button]:first')

  imageCopyButton = (): PageElement => cy.get('[data-qa=copy-image-button]:first')

  imageCopyBarcodeFeedbackContainer = (): PageElement => cy.get('[data-qa=copy-barcode-feedback-container-1]')

  sendMoreLegalMailLink = (): PageElement => cy.get('[data-qa=send-more-legal-mail]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }

  static goToPage = (): GenerateBarcodeImagePage => ChooseBarcodeOptionPage.goToPage().continueToImage()
}
