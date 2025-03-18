import type { ContactHelpdeskForm } from 'forms'

export default class ContactHelpdeskView {
  constructor(
    private readonly contactHelpdeskForm: ContactHelpdeskForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: ContactHelpdeskForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.contactHelpdeskForm,
      errors: this.errors || [],
    }
  }
}
