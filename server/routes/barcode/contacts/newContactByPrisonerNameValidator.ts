import type { CreateNewContactByPrisonerNameForm } from 'forms'
import validatePrisonId from '../validators/prisonIdValidator'
import formatErrors from '../../errorFormatter'
import validatePrisonerDob from '../validators/prisonerDobValidator'

export default function validateNewContactByPrisonerName(
  createNewContactForm: CreateNewContactByPrisonerNameForm
): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...formatErrors('prisonerDob', validatePrisonerDob(createNewContactForm.prisonerDob)))
  errors.push(...formatErrors('prisonId', validatePrisonId(createNewContactForm.prisonId)))

  return errors
}
