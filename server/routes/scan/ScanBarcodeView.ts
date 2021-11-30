import type { ScanBarcodeForm } from 'forms'

export default class ScanBarcodeView {
  constructor(
    private readonly scanBarcodeForm: ScanBarcodeForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: ScanBarcodeForm; errors: Array<Record<string, string>> } {
    return {
      form: this.scanBarcodeForm,
      errors: this.errors || [],
    }
  }
}
