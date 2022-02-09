export default function validateProblemDetail(problemDetail?: string): Array<string> {
  const errors: Array<string> = []

  if (!problemDetail) {
    errors.push('Enter details of the problem you experienced')
  } else if (problemDetail.length > 500) {
    errors.push('Details must be 500 characters or less')
  }

  return errors
}
