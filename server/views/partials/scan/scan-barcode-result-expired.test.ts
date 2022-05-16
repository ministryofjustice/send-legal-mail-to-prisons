import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import moment from 'moment'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/partials/scan/scan-barcode-result-expired.njk')

describe('Expired Scan Barcode Result ', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should show created details', () => {
    const createdDate = moment().subtract(10, 'days')
    const expectedCreatedDate = moment(createdDate).format('D MMMM YYYY')

    viewContext = {
      form: {
        errorCode: {
          createdDate,
          barcodeExpiryDays: 30,
          createdBy: 'Aardvark Lawyers',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p[data-qa=created-date]').text()).toContain('10 days ago')
    expect($('p[data-qa=created-date]').text()).toContain(`on ${expectedCreatedDate}`)
    expect($('[data-qa=created-by]').text()).toContain('Aardvark Lawyers')
  })
})
