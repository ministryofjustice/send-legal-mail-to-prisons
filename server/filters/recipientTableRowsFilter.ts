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
        text: recipient.prisonNumber ? recipient.prisonNumber : moment(recipient.prisonerDob).format('D MMMM YYYY'), // Column 2 - Prison number or DOB
      },
      { text: recipient.prison.addressName }, // Column 3 - Prison name
      {
        html: `
          <a href="/barcode/edit-contact/${recipient.contactId}" class="govuk-link govuk-link--no-visited-state">Edit details<span class="govuk-visually-hidden"> for ${recipient.prisonerName}</span></a>
          <a href="/barcode/review-recipients/remove/${idx}" class="govuk-link govuk-link--no-visited-state">Remove<span class="govuk-visually-hidden"> ${recipient.prisonerName}</span></a>`,
      }, // Column 4 - Editing options links
    )
  })
}
