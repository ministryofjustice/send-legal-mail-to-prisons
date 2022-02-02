import type { ChooseContactForm } from 'forms'
import { Contact } from '../../../@types/sendLegalMailApiClientTypes'

export default class ChooseContactView {
  constructor(
    private readonly chooseContactForm: ChooseContactForm,
    private readonly searchName: string,
    private readonly contacts: Array<Contact>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: ChooseContactForm
    searchName: string
    contacts: Array<Contact>
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.chooseContactForm,
      searchName: this.searchName,
      contacts: this.contacts,
      errors: this.errors || [],
    }
  }
}
