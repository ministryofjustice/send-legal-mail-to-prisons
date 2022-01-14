import { Request } from 'express'

const PRISON_NUMBER_PATTERN = /^[A-Z]\d{4}[A-Z]{2}$/

export default function validatePrisonNumber(req: Request): boolean {
  const errors: Array<Record<string, string>> = []
  if (!req.body.prisonNumber) {
    errors.push({ href: '#prisonNumber', text: 'Enter a prison number' })
  } else if (!PRISON_NUMBER_PATTERN.test(req.body.prisonNumber)) {
    errors.push({ href: '#prisonNumber', text: 'Enter the prison number in the correct format.' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}
