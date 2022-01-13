import Page, { PageElement } from '../page'

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
    this.imageDownloadButton().should('exist')
    return Page.verifyOnPage(GenerateBarcodeImagePage)
  }

  barcodeAddressImage = (): PageElement => cy.get('img.barcode-address-image')

  imageDownloadButton = (): PageElement => cy.get('[data-qa=download-image-button]')

  imageCopyButton = (): PageElement => cy.get('[data-qa=copy-image-button]')
}
