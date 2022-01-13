import { Recipient } from '../../@types/prisonTypes'

export default class ReviewRecipientsView {
  constructor(private readonly recipients: Array<Recipient>, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    recipients: Array<Recipient>
    errors: Array<Record<string, string>>
  } {
    return {
      recipients: this.recipients,
      errors: this.errors || [],
    }
  }
}
