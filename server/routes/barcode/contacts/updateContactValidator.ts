import type { EditContactForm } from 'forms'
import validatePrisonerName from '../validators/prisonerNameValidator'
import formatErrors from '../../errorFormatter'
import validatePrisonId from '../validators/prisonIdValidator'
import validatePrisonNumber from '../validators/prisonNumberValidator'
import validatePrisonerDob from '../validators/prisonerDobValidator'

export default function validateContact(editContactForm: EditContactForm): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  errors.push(...formatErrors('name', validatePrisonerName(editContactForm.name)))
  errors.push(...formatErrors('prisonId', validatePrisonId(editContactForm.prisonId)))
  if (!editContactForm.dob && !editContactForm.prisonNumber) {
    errors.push(...formatErrors('prisonNumber', ['Enter at least one of prison number or date of birth']))
  }
  if (editContactForm.prisonNumber) {
    errors.push(...formatErrors('prisonNumber', validatePrisonNumber(editContactForm.prisonNumber)))
  }
  if (editContactForm.dob) {
    errors.push(...formatErrors('dob', validatePrisonerDob(editContactForm.dob)))
  }
  return errors
}
