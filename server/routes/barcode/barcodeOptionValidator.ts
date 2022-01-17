import { Request } from 'express'

export default function validateBarcodeOption(req: Request): boolean {
  const errors: Array<Record<string, string>> = []
  if (!req.body.barcodeOption) {
    errors.push({ href: '#barcodeOption', text: 'Select an option' })
  } else if (!(req.body.barcodeOption === 'image' || req.body.barcodeOption === 'coversheet')) {
    errors.push({ href: '#barcodeOption', text: 'Select an option' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}
