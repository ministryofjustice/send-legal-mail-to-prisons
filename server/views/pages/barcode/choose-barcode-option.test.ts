import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/choose-barcode-option.njk')

describe('Choose Barcode Option View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#choose-barcode-option').length).toStrictEqual(1)
  })

  it('should show available radio options', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#barcodeOption').val()).toEqual('image')
    expect($('#barcodeOption-2').val()).toEqual('coversheet')
  })

  it('should show continue button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa="continue-button"]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ href: '#barcodeOption', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#barcodeOption"]').text()).toEqual('some-error')
    expect($('#barcodeOption-error').text()).toContain('some-error')
  })
})
