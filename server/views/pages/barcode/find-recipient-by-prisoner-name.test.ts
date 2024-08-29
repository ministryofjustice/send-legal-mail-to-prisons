import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/find-recipient-by-prisoner-name.njk')

describe('Find Recipient By Prisoner Name View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#find-recipient-by-prisoner-name').length).toStrictEqual(1)
  })

  it('should display name input', () => {
    viewContext = { errors: [], form: { prisonerName: 'John Smith' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#prisonerName').val()).toStrictEqual('John Smith')
  })

  it('should show the enter button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa=enter-button]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ href: '#prisonerName', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#prisonerName"]').text()).toEqual('some-error')
    expect($('#prisonerName-error').text()).toContain('some-error')
  })
})
