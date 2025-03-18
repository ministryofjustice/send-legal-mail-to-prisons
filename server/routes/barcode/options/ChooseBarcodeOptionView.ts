import type { ChooseBarcodeOptionForm } from 'forms'

export default class ChooseBarcodeOptionView {
  constructor(
    private readonly chooseBarcodeOptionForm: ChooseBarcodeOptionForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: ChooseBarcodeOptionForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.chooseBarcodeOptionForm,
      errors: this.errors || [],
    }
  }
}
