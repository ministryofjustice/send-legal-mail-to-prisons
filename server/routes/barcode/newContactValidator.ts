import { Request } from 'express'

const PRISONER_NAME_PATTERN = /^[a-zA-Z '`-]+$/

export default function validateNewContact(req: Request): boolean {
  const errors: Array<Record<string, string>> = []

  if (!req.body.prisonId) {
    errors.push({ href: '#prisonId', text: 'Select a prison name' })
  }
  if (!req.body.prisonerName) {
    errors.push({ href: '#prisonerName', text: 'Enter a full name' })
  } else {
    req.body.prisonerName = req.body.prisonerName.trim()
    if (!PRISONER_NAME_PATTERN.test(req.body.prisonerName)) {
      errors.push({ href: '#prisonerName', text: 'Enter names that only use letters, not numbers or symbols.' })
    }
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}