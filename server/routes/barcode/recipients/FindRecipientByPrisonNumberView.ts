import type { FindRecipientByPrisonNumberForm } from 'forms'

export default class FindRecipientByPrisonNumberView {
  constructor(
    private readonly findRecipientForm: FindRecipientByPrisonNumberForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: FindRecipientByPrisonNumberForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
    }
  }
}
