import type { CreateNewContactByPrisonerNameForm } from 'forms'
import type { Prison } from 'prisonTypes'
import getPrisonDropdown, { DropDownOption } from './prisonDropdown'

export default class CreateContactByPrisonerNameView {
  constructor(
    private readonly createNewContactForm: CreateNewContactByPrisonerNameForm,
    private readonly prisonRegister: Array<Prison>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: CreateNewContactByPrisonerNameForm
    errors: Array<Record<string, string>>
    prisonRegister: Array<DropDownOption>
  } {
    return {
      form: this.createNewContactForm,
      errors: this.errors || [],
      prisonRegister: getPrisonDropdown(this.prisonRegister, this.createNewContactForm.prisonId),
    }
  }
}
