import type { CreateNewContactForm } from 'forms'
import validatePrisonerName from './prisonerNameValidator'
import validatePrisonId from './prisonIdValidator'
import formatErrors from '../errorFormatter'

export default function validateNewContact(createNewContactForm: CreateNewContactForm): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...formatErrors('prisonerName', validatePrisonerName(createNewContactForm.prisonerName)))
  errors.push(...formatErrors('prisonId', validatePrisonId(createNewContactForm.prisonId)))

  return errors
}
