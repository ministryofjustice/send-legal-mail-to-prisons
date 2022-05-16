import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/generate-barcode-image.njk')

const someImageUrl = 'data:text/plain;charset=utf-8;base64,VGVzdCBiYXJjb2RlIGltYWdl'
const anotherImageUrl = 'data:text/plain;charset=utf-8;base64,YW5vdGhlciBiYWNvZGUgaW1hZ2U='

describe('Generate barcode image view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#generate-barcode-image').length).toStrictEqual(1)
  })

  it('should display a single barcode image and buttons', () => {
    viewContext = { barcodeImages: [{ recipientName: 'some-name', barcodeImageUrl: someImageUrl }], errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('img.barcode-address-image').length).toStrictEqual(1)
    expect($('img.barcode-address-image').first().attr('alt')).toContain('some-name')
    expect($('button[data-qa=copy-image-button]').html()).toContain('some-name')
    expect($('a[data-qa=download-image-button]').html()).toContain('some-name')
    expect($('a[data-qa=download-image-button]').attr('href')).toEqual(someImageUrl)
  })

  it('should display multiple barcode images', () => {
    viewContext = {
      barcodeImages: [
        { recipientName: 'some-name', barcodeImageUrl: someImageUrl },
        { recipientName: 'another-name', barcodeImageUrl: anotherImageUrl },
      ],
      errors: [],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('img.barcode-address-image').length).toStrictEqual(2)
    expect($('img.barcode-address-image').eq(1).attr('alt')).toContain('another-name')
    expect($('button[data-qa=copy-image-button]').eq(1).html()).toContain('another-name')
    expect($('a[data-qa=download-image-button]').eq(1).html()).toContain('another-name')
    expect($('a[data-qa=download-image-button]').eq(1).attr('href')).toEqual(anotherImageUrl)
  })

  it('should display errors', () => {
    viewContext = { barcodeImages: [], errors: [{ text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').html()).toContain('some-error')
  })

  it('should link back to start of user journey', () => {
    viewContext = { barcodeImages: [], errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('a[data-qa=send-more-legal-mail]').attr('href')).toEqual('/barcode/find-recipient')
  })
})
