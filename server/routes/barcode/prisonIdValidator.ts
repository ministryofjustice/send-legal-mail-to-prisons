export default function validatePrisonId(prisonId?: string): Array<Record<string, string>> {
  const errors: Array<Record<string, string>> = []

  if (!prisonId) {
    errors.push({ href: '#prisonId', text: 'Select a prison name' })
  }

  // TODO SLM-81 validate that the prison ID exists in our Prison store?

  return errors
}
