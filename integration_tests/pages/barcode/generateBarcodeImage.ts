/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'

export default class GenerateBarcodeImagePage extends Page {
  constructor() {
    super('generate-barcode-image')
  }

  barcodeAddressImageExists = (): GenerateBarcodeImagePage => {
    this.barcodeAddressImage().should('exist')
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  imageDownloadButtonExists = (downloadFileName: string): GenerateBarcodeImagePage => {
    const button = this.imageDownloadButton()
    button.should('exist')
    button.invoke('attr', 'download').should('equal', downloadFileName)
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  imageCopyButtonExists = (): GenerateBarcodeImagePage => {
    this.imageCopyButton().should('exist')
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  barcodeAddressImage = (): PageElement => cy.get('img.barcode-address-image')

  imageDownloadButton = (): PageElement => cy.get('[data-qa=download-image-button]')

  imageCopyButton = (): PageElement => cy.get('[data-qa=copy-image-button]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }

  static goToPage = (): GenerateBarcodeImagePage => ChooseBarcodeOptionPage.goToPage().continueToImage()
}
