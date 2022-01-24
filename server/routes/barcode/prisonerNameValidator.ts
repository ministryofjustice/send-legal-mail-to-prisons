const PRISONER_NAME_PATTERN = /^[a-zA-Z '`-]+$/

export default function validatePrisonerName(prisonerName?: string): Array<string> {
  const errors: Array<string> = []

  if (!prisonerName) {
    errors.push('Enter a full name')
  } else {
    if (prisonerName.trim().length > 60) {
      errors.push('Name can have a maximum length of 60 characters.')
    }
    if (!PRISONER_NAME_PATTERN.test(prisonerName)) {
      errors.push('Enter names that only use letters, not numbers or symbols.')
    }
  }

  return errors
}
