import type { CreateNewContactByPrisonNumberForm } from 'forms'
import { Prison } from '../../../@types/prisonTypes'

type DropDownOption = {
  value: string
  text: string
  selected?: boolean
}

export default class CreateContactView {
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
      prisonRegister: [
        { value: '', text: '' },
        ...this.prisonRegister
          .map(prison => {
            return {
              value: prison.id,
              text: prison.name,
              selected: prison.id === this.createNewContactForm.prisonId,
            }
          })
          .sort((a, b) => a.text.localeCompare(b.text)),
      ],
    }
  }
}
