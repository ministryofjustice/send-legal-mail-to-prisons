import { Request } from 'express'
import type { BarcodeEntryForm } from 'forms'

const TWELVE_DIGITS = /^\d{12}$/

export default function validate(form: BarcodeEntryForm, req: Request): boolean {
  const errors: Array<Record<string, string>> = []

  if (!validateBarcode(form.barcode)) {
    errors.push({ href: '#barcode', text: 'Enter the barcode number in the correct format' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}

const validateBarcode = (barcode: string): boolean => {
  return barcode && TWELVE_DIGITS.test(barcode)
}
