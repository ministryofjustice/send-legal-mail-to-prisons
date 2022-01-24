import moment from 'moment'

export default function validatePrisonerDob(prisonerDob?: string): Array<string> {
  const errors: Array<string> = []

  if (!prisonerDob) {
    errors.push('Enter a date of birth')
  } else {
    const dob = moment(prisonerDob, 'DD-MM-YYYY', true)
    if (!dob.isValid()) {
      errors.push('Enter a date of birth in the correct format')
    } else if (moment() < dob) {
      errors.push('Enter a date of birth in the past')
    }
  }

  return errors
}
