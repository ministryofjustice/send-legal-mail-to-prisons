import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
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
    viewContext = {
      barcodeImages: [
        {
          barcodeImageUrl: someImageUrl,
          barcodeImageName: 'some-image-name',
          recipientName: 'some-name',
          copyButtonHtml: 'some-copy-html',
          downloadButtonHtml: 'some-download-html',
        },
      ],
      errors: [],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('img.barcode-address-image').length).toStrictEqual(1)
    expect($('img.barcode-address-image').first().attr('alt')).toContain('some-name')
    expect($('button[data-qa=copy-image-button]').html()).toContain('some-copy-html')
    expect($('a[data-qa=download-image-button]').html()).toContain('some-download-html')
    expect($('a[data-qa=download-image-button]').attr('href')).toEqual(someImageUrl)
    expect($('a[data-qa=download-image-button]').attr('download')).toEqual('some-image-name')
  })

  it('should display multiple barcode images', () => {
    viewContext = {
      barcodeImages: [
        {
          barcodeImageUrl: someImageUrl,
          barcodeImageName: 'some-image-name',
          recipientName: 'some-name',
          copyButtonHtml: 'some-copy-html',
          downloadButtonHtml: 'some-download-html',
        },
        {
          barcodeImageUrl: anotherImageUrl,
          barcodeImageName: 'another-image-name',
          recipientName: 'another-name',
          copyButtonHtml: 'another-copy-html',
          downloadButtonHtml: 'another-download-html',
        },
      ],
      errors: [],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('img.barcode-address-image').length).toStrictEqual(2)
    expect($('img.barcode-address-image').eq(1).attr('alt')).toContain('another-name')
    expect($('button[data-qa=copy-image-button]').eq(1).html()).toContain('another-copy-html')
    expect($('a[data-qa=download-image-button]').eq(1).html()).toContain('another-download-html')
    expect($('a[data-qa=download-image-button]').eq(1).attr('href')).toEqual(anotherImageUrl)
    expect($('a[data-qa=download-image-button]').eq(1).attr('download')).toEqual('another-image-name')
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
