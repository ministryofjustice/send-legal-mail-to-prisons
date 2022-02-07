import validateName from './nameValidator'

describe('nameValidator', () => {
  Array.of('John Smith', `David O'Leary`, `David O\`Leary`, `Trent Alexander-Arnold`).forEach(name => {
    it(`should validate given a valid name - ${name}`, () => {
      const errors = validateName(name)

      expect(errors).toStrictEqual([])
    })
  })

  Array.of(null, undefined, '').forEach(name => {
    it(`should not validate given null/empty name - '${name}'`, () => {
      const errors = validateName(name)

      expect(errors).toStrictEqual(['Enter a full name'])
    })
  })

  it(`should not validate a name that is too long'`, () => {
    const errors = validateName('ABCDEFGEH ABCDEFGEH ABCDEFGEH ABCDEFGEH ABCDEFGEH ABCDEFGEH A')

    expect(errors).toStrictEqual(['Name can have a maximum length of 60 characters.'])
  })
})
