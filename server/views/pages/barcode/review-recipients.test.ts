import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import type { Prison, Recipient } from 'prisonTypes'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/review-recipients.njk')

describe('Review Recipients View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  const HMP_BRINSFORD = {
    id: 'BSI',
    name: 'BRINSFORD (HMP)',
    premise: 'HMP BRINSFORD',
    street: 'New Road',
    locality: 'Featherstone',
    postalCode: 'WV10 7PY',
  } as Prison

  const recipients: Array<Recipient> = [
    { prisonNumber: 'A1234BC', prisonerName: 'John Smith', prison: HMP_BRINSFORD, contactId: 1 },
  ]

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#review-recipients').length).toStrictEqual(1)
  })

  it('should show recipients table', () => {
    viewContext = { recipients, errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#review-recipients-table').length).toStrictEqual(1)
  })

  it('should not automatically make check another recipient radio', () => {
    viewContext = { recipients, errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('input[data-qa=another-recipient-yes]').attr('checked')).toBeFalsy()
    expect($('input[data-qa=another-recipient-no]').attr('checked')).toBeFalsy()
  })

  it('should show another recipient errors', () => {
    viewContext = { recipients, errors: [{ href: '#anotherRecipient', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#anotherRecipient"]').text()).toEqual('some-error')
    expect($('#anotherRecipient-error').text()).toContain('some-error')
  })

  it('should make another recipient yes checked', () => {
    viewContext = { recipients, errors: [], form: { anotherRecipient: 'yes' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('input[data-qa=another-recipient-yes]').attr('checked')).toBeTruthy()
    expect($('input[data-qa=another-recipient-no]').attr('checked')).toBeFalsy()
  })

  it('should make another recipient no checked', () => {
    viewContext = { recipients, errors: [], form: { anotherRecipient: 'no' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('input[data-qa=another-recipient-yes]').attr('checked')).toBeFalsy()
    expect($('input[data-qa=another-recipient-no]').attr('checked')).toBeTruthy()
  })

  it('should show add another recipient link if no recipients table', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#review-recipients-table').length).toStrictEqual(0)
    expect($('a[data-qa=add-another-recipient]').length).toStrictEqual(1)
  })
})
