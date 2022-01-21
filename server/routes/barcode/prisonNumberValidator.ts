const PRISON_NUMBER_PATTERN = /^[A-Z]\d{4}[A-Z]{2}$/

export default function validatePrisonNumber(prisonNumber?: string): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  if (!prisonNumber) {
    errors.push({ href: '#prisonNumber', text: 'Enter a prison number' })
  } else if (!PRISON_NUMBER_PATTERN.test(prisonNumber)) {
    errors.push({ href: '#prisonNumber', text: 'Enter the prison number in the correct format.' })
  }

  return errors
}
