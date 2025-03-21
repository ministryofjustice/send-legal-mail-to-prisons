import validateEmail from './emailValidator'

describe('emailValidator', () => {
  Array.of('user@aardvark.com', 'user@aardvark.com.notcjsm.net', 'mailroom-user@hmpps.gov.uk').forEach(email => {
    it(`should validate given a valid email - ${email}`, () => {
      const errors = validateEmail(email)

      expect(errors).toStrictEqual([])
    })
  })

  Array.of(null, undefined, '').forEach(email => {
    it(`should validate given null/empty email - '${email}'`, () => {
      const errors = validateEmail(email)

      expect(errors).toStrictEqual(['Enter an email address'])
    })
  })

  it(`should validate given an email in the incorrect format'`, () => {
    const errors = validateEmail('not-a-valid-email')

    expect(errors).toStrictEqual(['Enter an email address in the correct format'])
  })

  Array.of('user@aardvark.com.cjsm.net', 'USER@AARDVARK.COM.CJSM.NET', 'user@cjsm.net', 'USER@CJSM.NET').forEach(
    email => {
      it(`should validate given a CJSM email address - ${email}`, () => {
        const errors = validateEmail(email)

        expect(errors).toStrictEqual([`Enter an email address which does not end 'cjsm.net'`])
      })
    },
  )
})
