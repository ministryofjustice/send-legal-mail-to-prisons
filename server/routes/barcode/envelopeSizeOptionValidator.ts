import { Request } from 'express'

export default function validateEnvelopeSizeOption(req: Request): boolean {
  const errors: Array<Record<string, string>> = []
  if (!req.body.envelopeSize) {
    errors.push({ href: '#envelopeSize', text: 'Select an option' })
  } else if (!(req.body.envelopeSize === 'dl' || req.body.envelopeSize === 'c4' || req.body.envelopeSize === 'c5')) {
    errors.push({ href: '#envelopeSize', text: 'Select an option' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}
