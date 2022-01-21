import type { CreateNewContactForm } from 'forms'
import validatePrisonerName from './prisonerNameValidator'
import validatePrisonId from './prisonIdValidator'

export default function validateNewContact(createNewContactForm: CreateNewContactForm): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...validatePrisonerName(createNewContactForm.prisonerName))
  errors.push(...validatePrisonId(createNewContactForm.prisonId))

  return errors
}
