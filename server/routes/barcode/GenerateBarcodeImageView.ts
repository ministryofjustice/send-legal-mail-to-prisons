export default class GenerateBarcodeImageView {
  constructor(private readonly barcodeImageUrl: string, private readonly barcodeImageName: string) {}

  get renderArgs(): {
    barcodeImageUrl: string
    barcodeImageName: string
  } {
    return {
      barcodeImageUrl: this.barcodeImageUrl,
      barcodeImageName: this.barcodeImageName,
    }
  }
}
