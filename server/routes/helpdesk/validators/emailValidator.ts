const EMAIL_PATTERN = /^[\w!#$%&’*+/=?`'{|}~^-]+(?:\.[\w!#$%&’*+/=?`'{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/
const CJSM_NET_EMAIL = /^.+[@.]cjsm\.net$/i

export default function validateEmail(email?: string): Array<string> {
  const errors: Array<string> = []

  if (!email) {
    errors.push('Enter an email address')
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push('Enter an email address in the correct format')
  } else if (CJSM_NET_EMAIL.test(email)) {
    errors.push(`Enter an email address which does not end 'cjsm.net'`)
  }

  return errors
}
