import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/scan/scan-barcode-result.njk')

describe('Scan Barcode Result View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view for successful scan', () => {
    viewContext = {
      errors: [],
      form: { barcode: undefined, errorCode: undefined, createdBy: 'Aardvark Lawyers' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Ready for final delivery')
    expect($('p').text()).toContain('Aardvark Lawyers')
  })

  it('should render view for Duplicate scan', () => {
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'DUPLICATE',
          userMessage: 'Someone scanned this barcode at 9:11 am on 8 December 2021 at LEI. It may be an illegal copy.',
          scannedDate: '2021-12-08T09:11:23Z',
          scannedLocation: 'LEI',
          createdBy: 'Aardvark Lawyers',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('li strong').text()).toContain('Aardvark Lawyers')
    expect($('p strong').text()).toContain('9:11 am on 8 December 2021 at LEI')
  })

  it('should render view for Random Check scan', () => {
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'RANDOM_CHECK',
          userMessage: 'For additional security this barcode has been selected for a random check',
          createdBy: 'Aardvark Lawyers',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Item selected for a random check')
    expect($('p strong').text()).toContain('Aardvark Lawyers')
  })

  it('should render view for Expired scan', () => {
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'EXPIRED',
          userMessage: 'This barcode was created 120 days ago, on 8 December 2021',
          barcodeExpiryDays: 120,
          createdDate: '2021-12-08T09:11:23Z',
          createdBy: 'Aardvark Lawyers',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('li strong').text()).toContain('Aardvark Lawyers')
    expect($('p strong').text()).toContain('120 days ago, on 8 December 2021')
  })

  it('should render view for invalid/not found barcode', () => {
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'NOT_FOUND',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('p').text()).toContain('The barcode was not recognised')
  })
})
