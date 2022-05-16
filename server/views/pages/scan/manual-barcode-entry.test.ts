import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/scan/manual-barcode-entry.njk')

describe('Request one time code view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#manually-enter-barcode').length).toStrictEqual(1)
  })

  it('should display barcode input and errors', () => {
    viewContext = { form: { barcode: 'some-barcode' }, errors: [{ href: '#barcode', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#barcode').val()).toStrictEqual('some-barcode')
    expect($('#barcode').attr('inputmode')).toContain('numeric')
    expect($('#barcode').attr('data-inputmask')).toContain('"mask": "9999-9999-9999"')
    expect($('div.govuk-error-summary').find('a[href="#barcode"]').text()).toEqual('some-error')
    expect($('#barcode-error').text()).toContain('some-error')
  })

  it('should display barcode input and errors', () => {
    viewContext = { form: { barcode: 'some-barcode' }, errors: [{ href: '#barcode', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#barcode').val()).toStrictEqual('some-barcode')
    expect($('#barcode').attr('inputmode')).toContain('numeric')
    expect($('#barcode').attr('data-inputmask')).toContain('"mask": "9999-9999-9999"')
    expect($('div.govuk-error-summary').find('a[href="#barcode"]').text()).toEqual('some-error')
    expect($('#barcode-error').text()).toContain('some-error')
  })

  it('should display submit button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa=submit-barcode-button]').length).toStrictEqual(1)
  })
})
