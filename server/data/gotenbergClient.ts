import superagent from 'superagent'
import logger from '../../logger'
import config from '../config'
import type { PdfOptions } from '../middleware/setupPdfRenderer'

export default class GotenbergClient {
  async renderPdfFromHtml(html: string, options: PdfOptions): Promise<Buffer> {
    const { headerHtml, footerHtml, marginBottom, marginLeft, marginRight, marginTop } = options

    const request = superagent
      .post(`${config.gotenberg.url}/forms/chromium/convert/html`)
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
      logger.error(`Error POST to gotenberg:/forms/chromium/convert/html - {}`, err)
      return undefined
    }
  }
}
