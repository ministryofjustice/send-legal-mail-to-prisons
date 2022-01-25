import moment from 'moment'

export default function validatePrisonerDob(prisonerDob?: Date): Array<string> {
  const errors: Array<string> = []

  if (!prisonerDob) {
    errors.push('Enter a date of birth')
  } else if (Number.isNaN(prisonerDob.getTime())) {
    errors.push('Enter a date of birth in the correct format')
  } else if (moment().toDate() < prisonerDob) {
    errors.push('Enter a date of birth in the past')
  }

  return errors
}
