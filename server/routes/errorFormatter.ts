export default function formatErrors(errorField: string, errors: Array<string>): Array<Record<string, string>> {
  return errors.map(error => {
    return { href: `#${errorField}`, text: error }
  })
}
