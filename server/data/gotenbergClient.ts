import superagent from 'superagent'
import logger from '../../logger'
import config from '../config'

export type PdfOptions = {
  headerHtml?: string
  footerHtml?: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

const DEFAULT_PDF_OPTIONS: PdfOptions = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
}

export default class GotenbergClient {
  async renderPdfFromHtml(html: string, options: PdfOptions = DEFAULT_PDF_OPTIONS): Promise<Buffer> {
    const { headerHtml, footerHtml, marginBottom, marginLeft, marginRight, marginTop } = options

    const request = superagent
      .post(`${config.apis.gotenberg.url}/convert/html`)
      .set('Content-Type', 'multi-part/form-data')
      .buffer(true)
      .attach('files', Buffer.from(html), 'index.html')
      .responseType('blob')
      .field('marginTop', marginTop)
      .field('marginBottom', marginBottom)
      .field('marginLeft', marginLeft)
      .field('marginRight', marginRight)

    // Attach header and footer HTML blocks if specified
    if (headerHtml) request.attach('files', Buffer.from(headerHtml), 'header.html')
    if (footerHtml) request.attach('files', Buffer.from(footerHtml), 'footer.html')

    try {
      const response = await request
      return response.body
    } catch (err) {
      logger.error(`Error POST to gotenberg:/convert/html - {}`, err)
      return undefined
    }
  }
}
