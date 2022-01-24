export default function validatePrisonId(prisonId?: string): Array<string> {
  const errors: Array<string> = []

  if (!prisonId) {
    errors.push('Select a prison name')
  }

  // TODO SLM-81 validate that the prison ID exists in our Prison store?

  return errors
}
