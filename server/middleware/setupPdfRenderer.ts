import { Request, Response, NextFunction } from 'express'
import GotenbergClient from '../data/gotenbergClient'
import logger from '../../logger'

export type PdfOptions = {
  headerHtml?: string
  footerHtml?: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  filename: string
  contentDisposition: 'attachment' | 'inline'
}

const DEFAULT_PDF_OPTIONS: PdfOptions = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  filename: 'document.pdf',
  contentDisposition: 'inline',
}

/*
 * This function accepts a Gotenberg client as its only argument.
 * It returns a handler function to render a normal HTML view template to
 * produce the raw HTML (including images, stylesheet etc). It then uses a
 * callback function to pass rendered HTML view into the Gotenberg client
 * to produce and return a PDF document.
 */
export default function setupPdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPDF = (view: string, pageData: object, pdfOptions?: PdfOptions): void => {
      const options = { ...DEFAULT_PDF_OPTIONS, ...pdfOptions }
      res.render(view, pageData, async (error: Error, html: string) => {
        if (error) {
          throw error
        }

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `${options.contentDisposition}; filename=${options.filename}`)

        try {
          const pdfContent = await client.renderPdfFromHtml(html, options)
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
