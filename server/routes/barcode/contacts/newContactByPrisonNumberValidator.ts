import type { CreateNewContactByPrisonNumberForm } from 'forms'
import validatePrisonerName from '../validators/prisonerNameValidator'
import validatePrisonId from '../validators/prisonIdValidator'
import formatErrors from '../../errorFormatter'

export default function validateNewContact(
  createNewContactForm: CreateNewContactByPrisonNumberForm
): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...formatErrors('prisonerName', validatePrisonerName(createNewContactForm.prisonerName)))
  errors.push(...formatErrors('prisonId', validatePrisonId(createNewContactForm.prisonId)))

  return errors
}
