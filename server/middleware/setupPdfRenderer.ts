import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfOptions } from '../data/gotenbergClient'
import logger from '../../logger'

/*
 * This function accepts a Gotenberg client as its only argument.
 * It returns a handler function to render a normal HTML view template to
 * produce the raw HTML (including images, stylesheet etc). It then uses a
 * callback function to pass rendered HTML view into the Gotenberg client
 * to produce and return a PDF document.
 */

export default function setupPdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPDF = (
      view: string,
      pageData: object,
      options: { filename: string; pdfOptions?: PdfOptions } = { filename: 'document.pdf' }
    ): void => {
      res.render(view, pageData, async (error: Error, html: string) => {
        if (error) {
          throw error
        }

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `attachment; filename=${options.filename}`)

        try {
          const pdfContent = await client.renderPdfFromHtml(html, options.pdfOptions)
          res.send(pdfContent)
        } catch (pdfGenerationError) {
          logger.error(pdfGenerationError)
          throw new Error('Could not generate PDF')
        }
      })
    }
    next()
  }
}
