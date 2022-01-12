import type { CreateNewContactForm } from 'forms'
import { Prison } from '../../@types/prisonTypes'

export default class CreateContactView {
  constructor(
    private readonly createNewContactForm: CreateNewContactForm,
    private readonly prisonRegister: Array<Prison>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: CreateNewContactForm
    errors: Array<Record<string, string>>
    prisonRegister: Array<Record<string, string>>
  } {
    return {
      form: this.createNewContactForm,
      errors: this.errors || [],
      prisonRegister: [
        { value: '', text: '' },
        ...(this.prisonRegister || [])
          .map(prison => {
            return {
              value: prison.id,
              text: prison.name,
            }
          })
          .sort((a, b) => a.text.localeCompare(b.text)),
      ],
    }
  }
}
