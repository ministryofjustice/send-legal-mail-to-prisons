import type { CreateNewContactByPrisonNumberForm } from 'forms'
import type { Prison } from 'prisonTypes'
import getPrisonDropdown, { DropDownOption } from './prisonDropdown'

export default class CreateContactByPrisonNumberView {
  constructor(
    private readonly createNewContactForm: CreateNewContactByPrisonNumberForm,
    private readonly prisonRegister: Array<Prison>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: CreateNewContactByPrisonNumberForm
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
