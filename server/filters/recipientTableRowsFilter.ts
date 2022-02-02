import moment from 'moment'
import type { Recipient } from 'prisonTypes'

type TableCell = {
  text?: string
  html?: string
}

export default function recipientTableRowsFilter(recipients: Array<Recipient>): Array<Array<TableCell>> {
  return recipients.map((recipient, idx) => {
    return Array.of(
      { text: recipient.prisonerName }, // Column 1 - Prisoner Name
      {
        text: recipient.prisonNumber ? recipient.prisonNumber : moment(recipient.prisonerDob).format('DD-MM-YYYY'), // Column 2 - Prison number or DOB
      },
      { text: recipient.prisonAddress.premise }, // Column 3 - Prison name
      { html: '<a href="" class="govuk-link">Edit details</a>' }, // Column 4 - Edit recipient details link - TODO SLM-63
      { html: `<a href="/barcode/review-recipients/remove/${idx}" class="govuk-link">Remove</a>` } // Column 5 - Remove recipient link
    )
  })
}
