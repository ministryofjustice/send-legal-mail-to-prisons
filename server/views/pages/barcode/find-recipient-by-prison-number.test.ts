import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/find-recipient-by-prison-number.njk')

describe('Find Recipient By Prison Number View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#find-recipient-by-prison-number').length).toStrictEqual(1)
  })

  it('should display prison number input', () => {
    viewContext = { errors: [], form: { prisonNumber: 'some-prison-number' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#prisonNumber').val()).toStrictEqual('some-prison-number')
  })

  it('should show the enter button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa=enter-button]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ href: '#prisonNumber', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#prisonNumber"]').text()).toEqual('some-error')
    expect($('#prisonNumber-error').text()).toContain('some-error')
  })
})
