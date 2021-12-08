import { Request } from 'express'
import type { ManualEntryBarcodeForm } from 'forms'

const FOUR_DIGITS = /^\d{4}$/

export default function validate(form: ManualEntryBarcodeForm, req: Request): boolean {
  const errors: Array<Record<string, string>> = []

  if (!validateBarcodeElements(form)) {
    errors.push({ href: '#barcodeElement1', text: 'Enter the barcode number in the correct format' })
    errors.push({ href: '#barcodeElement2' })
    errors.push({ href: '#barcodeElement3' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}

const validateBarcodeElements = (form: ManualEntryBarcodeForm): boolean => {
  const { barcodeElement1, barcodeElement2, barcodeElement3 } = form
  return (
    validateBarcodeElement(barcodeElement1) &&
    validateBarcodeElement(barcodeElement2) &&
    validateBarcodeElement(barcodeElement3)
  )
}

const validateBarcodeElement = (element: string): boolean => {
  return element && FOUR_DIGITS.test(element)
}
