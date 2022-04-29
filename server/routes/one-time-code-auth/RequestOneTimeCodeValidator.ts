import { Request } from 'express'
import type { RequestOneTimeCodeForm } from 'forms'

export default function validate(form: RequestOneTimeCodeForm, req: Request): boolean {
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
  const emailRegExp = /^[\w!#$%&’*+/=?`'{|}~^-]+(?:\.[\w!#$%&’*+/=?`'{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/
  const cjsmRegExp = /^.+[@.]cjsm\.net$/
  return emailRegExp.test(email.toLowerCase()) && cjsmRegExp.test(email.toLowerCase())
}
