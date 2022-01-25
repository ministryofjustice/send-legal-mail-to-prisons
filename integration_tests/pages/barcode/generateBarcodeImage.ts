/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'

export default class GenerateBarcodeImagePage extends Page {
  constructor() {
    super('generate-barcode-image')
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

  barcodeAddressImage = (): PageElement => cy.get('img.barcode-address-image')

  imageDownloadButton = (): PageElement => cy.get('[data-qa=download-image-button]')

  imageCopyButton = (): PageElement => cy.get('[data-qa=copy-image-button]')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
  }

  static goToPage = (): GenerateBarcodeImagePage => ChooseBarcodeOptionPage.goToPage().continueToImage()
}
