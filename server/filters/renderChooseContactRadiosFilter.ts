import type { RadioButtonOption } from 'forms'
import moment from 'moment'
import type { Contact } from 'sendLegalMailApiClient'

export default function renderChooseContactRadiosFilter(
  searchName: string,
  contacts: Array<Contact>,
): Array<RadioButtonOption> {
  const contactOptions = contacts.map(contact => {
    let text = contact.prisonerName
    if ((contact.prisonNumber?.trim() ?? '') !== '') {
      text += ` ${contact.prisonNumber}`
    } else if ((contact.dob?.trim() ?? '') !== '') {
      text += ` ${moment(contact.dob, 'YYYY-MM-DD').format('D MMMM YYYY')}`
    }
    return {
      value: contact.id.toString(),
      text,
      checked: false,
    }
  })
  contactOptions.push({ value: '-1', text: `I want to send mail to a different "${searchName}"`, checked: false })
  return contactOptions
}
