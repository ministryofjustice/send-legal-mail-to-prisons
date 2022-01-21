const PRISONER_NAME_PATTERN = /^[a-zA-Z '`-]+$/

export default function validatePrisonerName(prisonerName?: string): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  if (!prisonerName) {
    errors.push({ href: '#prisonerName', text: 'Enter a full name' })
  } else if (prisonerName.trim().length > 60) {
    errors.push({ href: '#prisonerName', text: 'Name can have a maximum length of 60 characters.' })
  } else if (!PRISONER_NAME_PATTERN.test(prisonerName)) {
    errors.push({ href: '#prisonerName', text: 'Enter names that only use letters, not numbers or symbols.' })
  }

  return errors
}
