import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/pdf/print-coversheets.njk')

describe('Print Coversheets View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [], form: { envelopeSize: 'dl' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#print-coversheets').length).toStrictEqual(1)
  })

  it('should show correct text given dl envelope was selected', () => {
    viewContext = { errors: [], form: { envelopeSize: 'dl' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.envelope.dl p').text()).toContain('Fold each sheet in thirds')
  })

  it('should show correct text given c5 envelope was selected', () => {
    viewContext = { errors: [], form: { envelopeSize: 'c5' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.envelope.c5 p').text()).toContain('Fold each sheet in half')
  })

  it('should show correct text given c4 envelope was selected', () => {
    viewContext = { errors: [], form: { envelopeSize: 'c4' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.envelope.c4 p').text()).not.toContain('Fold each sheet')
  })
})
