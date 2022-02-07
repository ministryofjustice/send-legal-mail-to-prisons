import validateEmail from './emailValidator'

describe('emailValidator', () => {
  Array.of('user@aardvark.com.cjsm.net', 'mailroom-user@hmpps.gov.uk').forEach(email => {
    it(`should validate given a valid email - ${email}`, () => {
      const errors = validateEmail(email)

      expect(errors).toStrictEqual([])
    })
  })

  Array.of(null, undefined, '').forEach(email => {
    it(`should not validate given null/empty email - '${email}'`, () => {
      const errors = validateEmail(email)

      expect(errors).toStrictEqual(['Enter an email address'])
    })
  })

  it(`should not validate a email in the incorrect format'`, () => {
    const errors = validateEmail('not-a-valid-email')

    expect(errors).toStrictEqual(['Enter an email address in the correct format'])
  })
})
