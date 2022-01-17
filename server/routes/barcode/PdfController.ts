import { Request, Response } from 'express'

export type EnvelopeSizeSpec = {
  key: string
  label: string
  description: string
  width: number
  height: number
}
const ENVELOPE_SIZES: Array<EnvelopeSizeSpec> = [
  { key: 'd4', label: 'D4', description: 'A4 folder in thirds', width: 220, height: 110 },
  { key: 'c5', label: 'C5', description: 'A4 folder in half or A5 not folded', width: 229, height: 162 },
  { key: 'c4', label: 'C4', description: 'A4 not folded', width: 229, height: 324 },
]

export default class PdfController {
  async getEnvelopeSizeView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    return res.render('pages/barcode/pdf/select-envelope-size', { envelopeSizes: ENVELOPE_SIZES })
  }
}
