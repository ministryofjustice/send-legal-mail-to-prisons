import type { Recipient } from 'prisonTypes'
import type { ReviewRecipientsForm } from 'forms'

export default class ReviewRecipientsView {
  constructor(
    private readonly recipients: Array<Recipient>,
    private readonly form?: ReviewRecipientsForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    recipients: Array<Recipient>
    form: ReviewRecipientsForm
    errors: Array<Record<string, string>>
  } {
    return {
      recipients: this.recipients,
      form: this.form,
      errors: this.errors || [],
    }
  }
}
