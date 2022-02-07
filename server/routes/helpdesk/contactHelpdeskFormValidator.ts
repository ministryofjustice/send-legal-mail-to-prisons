import type { ContactHelpdeskForm } from 'forms'
import formatErrors from '../errorFormatter'
import validateName from './validators/nameValidator'
import validateEmail from './validators/emailValidator'
import validateProblemDetail from './validators/problemDetailValidator'

export default function validate(createNewContactForm: ContactHelpdeskForm): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...formatErrors('problemDetail', validateProblemDetail(createNewContactForm.problemDetail)))
  errors.push(...formatErrors('name', validateName(createNewContactForm.name)))
  errors.push(...formatErrors('email', validateEmail(createNewContactForm.email)))

  return errors
}
