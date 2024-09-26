import nock from 'nock'
import GotenbergClient from './gotenbergClient'
import config from '../config'
import { PdfOptions } from '../middleware/setupPdfRenderer'

const DEFAULT_PDF_OPTIONS: PdfOptions = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  filename: 'document.pdf',
  contentDisposition: 'inline',
}

describe('Gotenberg client tests', () => {
  let fakeApi: nock.Scope
  config.apis.gotenberg.url = 'http://localhost:8200'

  beforeEach(() => {
    fakeApi = nock(config.apis.gotenberg.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  const client = new GotenbergClient()

  const pdfStream = Buffer.from('some PDF encoded data')
  const htmlString = '<html><head><title>A title</title></head><body><p>A document</p></body>'

  describe('Render HTML as PDF', () => {
    it('POST /forms/chromium/convert/html', async () => {
      fakeApi.post('/forms/chromium/convert/html').reply(200, pdfStream)
      const data = await client.renderPdfFromHtml(htmlString, DEFAULT_PDF_OPTIONS)
      expect(data).toEqual(Buffer.from(pdfStream))
      expect(nock.isDone()).toBe(true)
    })
  })
})
