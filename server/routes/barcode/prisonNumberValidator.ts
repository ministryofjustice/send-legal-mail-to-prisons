const PRISON_NUMBER_PATTERN = /^[A-Z]\d{4}[A-Z]{2}$/

export default function validatePrisonNumber(prisonNumber?: string): Array<string> {
  const errors: Array<string> = []

  if (!prisonNumber) {
    errors.push('Enter a prison number')
  } else if (!PRISON_NUMBER_PATTERN.test(prisonNumber)) {
    errors.push('Enter the prison number in the correct format.')
  }

  return errors
}
