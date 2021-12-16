import type { FindRecipientForm } from 'forms'

export default class FindRecipientView {
  constructor(
    private readonly findRecipientForm: FindRecipientForm,
    private readonly errors?: Array<Record<string, string>>,
    private readonly barcode?: string
  ) {}

  get renderArgs(): { form: FindRecipientForm; errors: Array<Record<string, string>>; barcode: string } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
      barcode: this.barcode,
    }
  }
}
