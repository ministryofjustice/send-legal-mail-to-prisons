import { Request } from 'express'
import type { RequestLinkForm } from 'forms'

export default function validate(form: RequestLinkForm, req: Request): boolean {
  const errors: Array<Record<string, string>> = []

  if (!form.email) {
    errors.push({ href: '#email', text: 'Enter your CJSM email address' })
  } else if (!validateEmail(form.email)) {
    errors.push({ href: '#email', text: 'Enter an email address in the correct format' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return false
  }

  return true
}

function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email.toLowerCase())
}
