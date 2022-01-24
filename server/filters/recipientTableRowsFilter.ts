import { Recipient } from '../@types/prisonTypes'

type TableCell = {
  text?: string
  html?: string
}

export default function recipientTableRowsFilter(recipients: Array<Recipient>): Array<Array<TableCell>> {
  return recipients.map((recipient, idx) => {
    return Array.of(
      { text: recipient.prisonerName }, // Column 1 - Prisoner Name
      { text: recipient.prisonNumber }, // Column 2 - Prison number or DOB - TODO SLM-81
      { text: recipient.prisonAddress.premise }, // Column 3 - Prison name
      { html: '<a href="" class="govuk-link">Edit details</a>' }, // Column 4 - Edit recipient details link - TODO SLM-63
      { html: `<a href="/barcode/review-recipients/remove/${idx}" class="govuk-link">Remove</a>` } // Column 5 - Remove recipient link
    )
  })
}
