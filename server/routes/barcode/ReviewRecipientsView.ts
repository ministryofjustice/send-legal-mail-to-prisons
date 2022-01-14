import { Recipient } from '../../@types/prisonTypes'

type TableCell = {
  text?: string
  html?: string
}

export default class ReviewRecipientsView {
  constructor(private readonly recipients: Array<Recipient>, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    recipients: Array<Array<TableCell>>
    errors: Array<Record<string, string>>
  } {
    return {
      recipients: this.generateTableRows(),
      errors: this.errors || [],
    }
  }

  private generateTableRows(): Array<Array<TableCell>> {
    return this.recipients.map(recipient => {
      return Array.of(
        { text: recipient.prisonerName }, // Column 1 - Prisoner Name
        { text: recipient.prisonNumber }, // Column 2 - Prison number or DOB - TODO SLM-81
        { text: recipient.prisonAddress.premise }, // Column 3 - Prison name
        { html: '<a href="" class="govuk-link">Edit details</a>' }, // Column 4 - Edit recipient details link - TODO SLM-63
        { html: '<a href="" class="govuk-link">Remove</a>' } // Column 5 - Remove recipient link - TODO SLM-83
      )
    })
  }
}
