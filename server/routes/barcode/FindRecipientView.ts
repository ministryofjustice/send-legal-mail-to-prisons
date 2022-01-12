import type { FindRecipientForm } from 'forms'

export default class FindRecipientView {
  constructor(
    private readonly findRecipientForm: FindRecipientForm,
    private readonly errors?: Array<Record<string, string>>,
    private readonly barcode?: string, // TODO - remove when temp create barcode button is not on Find Recipient screen
    private readonly barcodeImageUrl?: string // TODO - remove when temp create barcode button is not on Find Recipient screen
  ) {}

  get renderArgs(): {
    form: FindRecipientForm
    errors: Array<Record<string, string>>
    barcode: string
    barcodeImageUrl: string
  } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
      barcode: this.barcode,
      barcodeImageUrl: this.barcodeImageUrl,
    }
  }
}
