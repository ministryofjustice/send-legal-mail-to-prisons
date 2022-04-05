type BarcodeImage = {
  barcodeImageUrl: string
  barcodeImageName: string
  recipientName: string
}

export default class GenerateBarcodeImageView {
  constructor(private readonly barcodeImages: Array<BarcodeImage>) {}

  get renderArgs(): {
    barcodeImages: Array<BarcodeImage>
  } {
    return {
      barcodeImages: this.barcodeImages,
    }
  }
}
