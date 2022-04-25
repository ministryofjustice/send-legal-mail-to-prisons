import type { Prison, Recipient } from 'prisonTypes'
import recipientTableRowsFilter from './recipientTableRowsFilter'

const HMP_BRINSFORD = {
  id: 'BSI',
  addressName: 'HMP BRINSFORD',
  street: 'New Road',
  locality: 'Featherstone',
  postalCode: 'WV10 7PY',
} as Prison
const HMP_BRIXTON = {
  id: 'BXI',
  addressName: 'HMP BRIXTON',
  street: 'P O Box 369',
  locality: 'Jebb Avenue',
  postalCode: 'SW2 5XF',
} as Prison

describe('recipientTableRowsFilter', () => {
  it('should filter recipients into structure suitable for rendering in a govukTable', () => {
    const recipients: Array<Recipient> = [
      { prisonNumber: 'A1234BC', prisonerName: 'John Smith', prison: HMP_BRINSFORD, contactId: 1 },
      { prisonNumber: 'R9831RQ', prisonerName: 'Gage Hewitt', prison: HMP_BRIXTON, contactId: 2 },
    ]

    const tableRows = recipientTableRowsFilter(recipients)

    expect(tableRows).toStrictEqual([
      [
        { text: 'John Smith' },
        { text: 'A1234BC' },
        { text: 'HMP BRINSFORD' },
        {
          html: `
          <a href="/barcode/edit-contact/1" class="govuk-link govuk-link--no-visited-state">Edit details<span class="govuk-visually-hidden"> for John Smith</span></a>
          <a href="/barcode/review-recipients/remove/0" class="govuk-link govuk-link--no-visited-state">Remove<span class="govuk-visually-hidden"> John Smith</span></a>`,
        },
      ],
      [
        { text: 'Gage Hewitt' },
        { text: 'R9831RQ' },
        { text: 'HMP BRIXTON' },
        {
          html: `
          <a href="/barcode/edit-contact/2" class="govuk-link govuk-link--no-visited-state">Edit details<span class="govuk-visually-hidden"> for Gage Hewitt</span></a>
          <a href="/barcode/review-recipients/remove/1" class="govuk-link govuk-link--no-visited-state">Remove<span class="govuk-visually-hidden"> Gage Hewitt</span></a>`,
        },
      ],
    ])
  })

  it('should use prisoner DOB if prison number is missing', () => {
    const recipients: Array<Recipient> = [
      { prisonNumber: 'A1234BC', prisonerName: 'John Smith', prison: HMP_BRINSFORD, contactId: 1 },
      { prisonerDob: new Date(1990, 0, 1), prisonerName: 'Gage Hewitt', prison: HMP_BRIXTON, contactId: 2 },
    ]

    const tableRows = recipientTableRowsFilter(recipients)

    expect(tableRows).toStrictEqual([
      [
        { text: 'John Smith' },
        { text: 'A1234BC' },
        { text: 'HMP BRINSFORD' },
        {
          html: `
          <a href="/barcode/edit-contact/1" class="govuk-link govuk-link--no-visited-state">Edit details<span class="govuk-visually-hidden"> for John Smith</span></a>
          <a href="/barcode/review-recipients/remove/0" class="govuk-link govuk-link--no-visited-state">Remove<span class="govuk-visually-hidden"> John Smith</span></a>`,
        },
      ],
      [
        { text: 'Gage Hewitt' },
        { text: '1 January 1990' },
        { text: 'HMP BRIXTON' },
        {
          html: `
          <a href="/barcode/edit-contact/2" class="govuk-link govuk-link--no-visited-state">Edit details<span class="govuk-visually-hidden"> for Gage Hewitt</span></a>
          <a href="/barcode/review-recipients/remove/1" class="govuk-link govuk-link--no-visited-state">Remove<span class="govuk-visually-hidden"> Gage Hewitt</span></a>`,
        },
      ],
    ])
  })
})
