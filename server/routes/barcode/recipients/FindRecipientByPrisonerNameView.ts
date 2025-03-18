import type { FindRecipientByPrisonerNameForm } from 'forms'

export default class FindRecipientByPrisonerNameView {
  constructor(
    private readonly findRecipientForm: FindRecipientByPrisonerNameForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: FindRecipientByPrisonerNameForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.findRecipientForm,
      errors: this.errors || [],
    }
  }
}
