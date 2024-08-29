import fs from 'fs'
import * as cheerio from 'cheerio'
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
    viewContext = { envelopeSize: 'dl', numberOfCoversheets: 1, filename: 'SendLegalMail-2022-02-22-1-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#print-coversheets').length).toStrictEqual(1)
  })

  it('should show correct text given dl envelope was selected', () => {
    viewContext = { envelopeSize: 'dl', numberOfCoversheets: 1, filename: 'SendLegalMail-2022-02-22-1-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('ol li').text()).toContain('Fold each sheet in thirds')
  })

  it('should show correct text given c5 envelope was selected', () => {
    viewContext = { envelopeSize: 'c5', numberOfCoversheets: 1, filename: 'SendLegalMail-2022-02-22-1-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('ol li').text()).toContain('Fold each sheet in half')
  })

  it('should show correct text given c4 envelope was selected', () => {
    viewContext = { envelopeSize: 'c4', numberOfCoversheets: 1, filename: 'SendLegalMail-2022-02-22-1-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p').text()).not.toContain('Fold each sheet')
  })

  it('should show correct filename and number of coversheets given 1 coversheet', () => {
    viewContext = { envelopeSize: 'c4', numberOfCoversheets: 1, filename: 'SendLegalMail-2022-02-22-1-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p').text()).toContain('file SendLegalMail-2022-02-22-1-DL.pdf with 1 coversheet ')
  })

  it('should show correct filename and number of coversheets given multiple coversheets', () => {
    viewContext = { envelopeSize: 'c4', numberOfCoversheets: 2, filename: 'SendLegalMail-2022-02-22-2-DL.pdf' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p').text()).toContain('file SendLegalMail-2022-02-22-2-DL.pdf with 2 coversheets ')
  })

  it('should include additional text for screen readers on the download button', () => {
    viewContext = {
      envelopeSize: 'c4',
      numberOfCoversheets: 2,
      filename: 'SendLegalMail-2022-02-22-2-DL.pdf',
      downloadButtonHtml: '<p>some-button-text</p>',
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('a[data-qa=download-pdf-button]').text()).toContain('some-button-text')
  })
})
