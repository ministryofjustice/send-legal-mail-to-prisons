import type { BarcodeEntryForm } from 'forms'

export default class BarcodeEntryView {
  constructor(
    private readonly barcodeEntryForm: BarcodeEntryForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): { form: BarcodeEntryForm; errors: Array<Record<string, string>> } {
    return {
      form: this.barcodeEntryForm,
      errors: this.errors || [],
    }
  }
}
