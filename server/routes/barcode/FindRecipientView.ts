import type { FindRecipientForm } from 'forms'

export default class FindRecipientView {
  constructor(
    private readonly findRecipientForm: FindRecipientForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: FindRecipientForm; errors: Array<Record<string, string>> } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
    }
  }
}
