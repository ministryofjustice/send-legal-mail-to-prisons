import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/partials/scan/scan-barcode-result-ok.njk')

describe('OK Scan Barcode Result ', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should show created details', () => {
    viewContext = {
      form: {
        createdBy: 'Aardvark Lawyers',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('[data-qa=created-by]').text()).toContain('Aardvark Lawyers')
  })
})
