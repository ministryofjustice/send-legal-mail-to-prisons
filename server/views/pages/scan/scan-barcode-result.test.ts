import fs from 'fs'
import cheerio from 'cheerio'
import moment from 'moment'
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
    const now = moment()
    const daysAgoCreated = 42
    const createdDate = now.subtract(daysAgoCreated, 'days')
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'EXPIRED',
          userMessage: `This barcode was created 42 days ago, on ${createdDate.format('D MMMM YYYY')}`,
          barcodeExpiryDays: 14, // expiry days is not the same as the number of days ago that the barcode was created
          createdDate: createdDate.toISOString(),
          createdBy: 'Aardvark Lawyers',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('li strong').text()).toContain('Aardvark Lawyers')
    expect($('p strong').text()).toContain(`42 days ago, on ${createdDate.format('D MMMM YYYY')}`)
    expect($('p').text()).toContain(`longer than 14 days to arrive`)
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

  it('should render view for user indicating a problem entering barcode', () => {
    viewContext = {
      errors: [],
      form: {
        barcode: undefined,
        createdBy: undefined,
        errorCode: {
          code: 'CANNOT_ENTER_BARCODE',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('p').text()).toContain(`barcode can't be linked to an approved sender`)
  })

  it('should render view for user indicating further checks are necessary', () => {
    viewContext = {
      errors: [],
      form: { barcode: undefined, errorCode: { code: 'FURTHER_CHECKS_NEEDED' }, createdBy: 'Aardvark Lawyers' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toEqual('Carry out further checks')
    expect($('p strong').text()).toContain('Aardvark Lawyers')
  })
})
