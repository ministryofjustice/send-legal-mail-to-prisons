const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function validateEmail(email?: string): Array<string> {
  const errors: Array<string> = []

  if (!email) {
    errors.push('Enter an email address')
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push('Enter an email address in the correct format')
  }

  return errors
}
