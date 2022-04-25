import type { Prison } from 'prisonTypes'
import type { EditContactForm } from 'forms'
import getPrisonDropdown, { DropDownOption } from './prisonDropdown'

export default class EditContactView {
  constructor(
    private readonly form: EditContactForm,
    private readonly prisonRegister: Array<Prison>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: EditContactForm
    prisonRegister: Array<DropDownOption>
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
      prisonRegister: getPrisonDropdown(this.prisonRegister, this.form.prisonId),
    }
  }
}
