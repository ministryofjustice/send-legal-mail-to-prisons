import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../../utils/nunjucksSetup'
import { ENVELOPE_SIZES } from '../../../../routes/barcode/pdf/PdfControllerView'

const snippet = fs.readFileSync('server/views/pages/barcode/pdf/select-envelope-size.njk')

describe('Select Envelope Size View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { envelopeSizes: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#select-envelope-size').length).toStrictEqual(1)
  })

  it('should render envelope sizes', () => {
    viewContext = { envelopeSizes: ENVELOPE_SIZES }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#envelopeSize').val()).toStrictEqual('dl')
    expect($('#envelopeSize-2').val()).toStrictEqual('c5')
    expect($('#envelopeSize-3').val()).toStrictEqual('c4')
  })

  it('should show continue button', () => {
    viewContext = { envelopeSizes: ENVELOPE_SIZES }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa="continue-button"]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { envelopeSizes: ENVELOPE_SIZES, errors: [{ href: '#envelopeSize', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#envelopeSize"]').text()).toEqual('some-error')
    expect($('#envelopeSize-error').text()).toContain('some-error')
  })
})
