import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/partials/scan/scan-barcode-result-duplicate.njk')

describe('Duplicate Scan Barcode Result ', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should show the original scan time and location', () => {
    viewContext = {
      form: {
        errorCode: {
          scannedDate: '2022-02-15T17:20:31.206490Z',
          scannedLocation: 'HMP Leeds',
          createdBy: 'Aardvark Lawyers',
          recipientName: 'Joe Spice',
          recipientPrisonNumber: 'A1234BC',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('strong[data-qa="original-scan"]').text()).toContain('5:20 pm on 15 February 2022 at HMP Leeds')
  })

  it('should show the barcode creator', () => {
    viewContext = {
      form: {
        errorCode: {
          scannedDate: '2022-02-15T17:20:31.206490Z',
          scannedLocation: 'HMP Leeds',
          createdBy: 'Aardvark Lawyers',
          recipientName: 'Joe Spice',
          recipientPrisonNumber: 'A1234BC',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('strong[data-qa="barcode-created-by"]').text()).toContain('Aardvark Lawyers')
  })

  it('should show name and prison number', () => {
    viewContext = {
      form: {
        errorCode: {
          scannedDate: '2022-02-15T17:20:31.206490Z',
          scannedLocation: 'HMP Leeds',
          createdBy: 'Aardvark Lawyers',
          recipientName: 'Joe Spice',
          recipientPrisonNumber: 'A1234BC',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('strong[data-qa="barcode-recipient"]').text()).toContain('Joe Spice, A1234BC')
  })

  it('should show name and dob if no prison number', () => {
    viewContext = {
      form: {
        errorCode: {
          scannedDate: '2022-02-15T17:20:31.206490Z',
          scannedLocation: 'HMP Leeds',
          createdBy: 'Aardvark Lawyers',
          recipientName: 'Joe Spice',
          recipientDob: '1990-01-31',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('strong[data-qa="barcode-recipient"]').text()).toContain('Joe Spice, 31-01-1990')
  })
})
