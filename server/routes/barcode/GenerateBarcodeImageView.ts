export default class GenerateBarcodeImageView {
  constructor(
    private readonly barcode: string,
    private readonly barcodeImageUrl: string,
    private readonly barcodeImageName: string
  ) {}

  get renderArgs(): {
    barcode: string
    barcodeImageUrl: string
    barcodeImageName: string
  } {
    return {
      barcode: this.barcode,
      barcodeImageUrl: this.barcodeImageUrl,
      barcodeImageName: this.barcodeImageName,
    }
  }
}
