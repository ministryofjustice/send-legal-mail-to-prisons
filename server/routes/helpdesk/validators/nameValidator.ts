const NAME_PATTERN = /^[a-zA-Z '`-]+$/

export default function validateName(name?: string): Array<string> {
  const errors: Array<string> = []

  if (!name) {
    errors.push('Enter a full name')
  } else {
    if (name.trim().length > 60) {
      errors.push('Name can have a maximum length of 60 characters.')
    }
    if (!NAME_PATTERN.test(name)) {
      errors.push('Enter names that only use letters, not numbers or symbols.')
    }
  }

  return errors
}
