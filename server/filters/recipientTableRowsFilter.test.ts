import type { PrisonAddress, Recipient } from 'prisonTypes'
import recipientTableRowsFilter from './recipientTableRowsFilter'

const HMP_BRINSFORD = {
  flat: null,
  premise: 'HMP BRINSFORD',
  street: 'New Road',
  locality: 'Featherstone',
  countyCode: null,
  area: 'Featherstone Wolverhampton',
  postalCode: 'WV10 7PY',
} as PrisonAddress
const HMP_BRIXTON = {
  flat: null,
  premise: 'HMP BRIXTON',
  street: 'P O Box 369',
  locality: 'Jebb Avenue',
  countyCode: null,
  area: 'Jebb Avenue London',
  postalCode: 'SW2 5XF',
} as PrisonAddress

describe('recipientTableRowsFilter', () => {
  it('should filter recipients into structure suitable for rendering in a govukTable', () => {
    const recipients: Array<Recipient> = [
      { prisonNumber: 'A1234BC', prisonerName: 'John Smith', prisonAddress: HMP_BRINSFORD, contactId: 1 },
      { prisonNumber: 'R9831RQ', prisonerName: 'Gage Hewitt', prisonAddress: HMP_BRIXTON, contactId: 2 },
    ]

    const tableRows = recipientTableRowsFilter(recipients)

    expect(tableRows).toStrictEqual([
      [
        { text: 'John Smith' },
        { text: 'A1234BC' },
        { text: 'HMP BRINSFORD' },
        {
          html: '<a href="/barcode/edit-contact/1" class="govuk-link govuk-link--no-visited-state">Edit details</a>',
          classes: 'govuk-table__cell--numeric',
        },
        {
          html: '<a href="/barcode/review-recipients/remove/0" class="govuk-link govuk-link--no-visited-state">Remove</a>',
          classes: 'govuk-table__cell--numeric',
        },
      ],
      [
        { text: 'Gage Hewitt' },
        { text: 'R9831RQ' },
        { text: 'HMP BRIXTON' },
        {
          html: '<a href="/barcode/edit-contact/2" class="govuk-link govuk-link--no-visited-state">Edit details</a>',
          classes: 'govuk-table__cell--numeric',
        },
        {
          html: '<a href="/barcode/review-recipients/remove/1" class="govuk-link govuk-link--no-visited-state">Remove</a>',
          classes: 'govuk-table__cell--numeric',
        },
      ],
    ])
  })

  it('should use prisoner DOB if prison number is missing', () => {
    const recipients: Array<Recipient> = [
      { prisonNumber: 'A1234BC', prisonerName: 'John Smith', prisonAddress: HMP_BRINSFORD, contactId: 1 },
      { prisonerDob: new Date(1990, 0, 1), prisonerName: 'Gage Hewitt', prisonAddress: HMP_BRIXTON, contactId: 2 },
    ]

    const tableRows = recipientTableRowsFilter(recipients)

    expect(tableRows).toStrictEqual([
      [
        { text: 'John Smith' },
        { text: 'A1234BC' },
        { text: 'HMP BRINSFORD' },
        {
          html: '<a href="/barcode/edit-contact/1" class="govuk-link govuk-link--no-visited-state">Edit details</a>',
          classes: 'govuk-table__cell--numeric',
        },
        {
          html: '<a href="/barcode/review-recipients/remove/0" class="govuk-link govuk-link--no-visited-state">Remove</a>',
          classes: 'govuk-table__cell--numeric',
        },
      ],
      [
        { text: 'Gage Hewitt' },
        { text: '1 January 1990' },
        { text: 'HMP BRIXTON' },
        {
          html: '<a href="/barcode/edit-contact/2" class="govuk-link govuk-link--no-visited-state">Edit details</a>',
          classes: 'govuk-table__cell--numeric',
        },
        {
          html: '<a href="/barcode/review-recipients/remove/1" class="govuk-link govuk-link--no-visited-state">Remove</a>',
          classes: 'govuk-table__cell--numeric',
        },
      ],
    ])
  })
})
