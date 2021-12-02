import type { ManualEntryBarcodeForm } from 'forms'

export default class ManualEntryBarcodeView {
  constructor(
    private readonly manualEntryBarcodeForm: ManualEntryBarcodeForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: ManualEntryBarcodeForm; errors: Array<Record<string, string>> } {
    return {
      form: this.manualEntryBarcodeForm,
      errors: this.errors || [],
    }
  }
}
