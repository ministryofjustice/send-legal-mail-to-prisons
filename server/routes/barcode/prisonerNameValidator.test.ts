import validatePrisonNumber from './prisonNumberValidator'
import validatePrisonerName from './prisonerNameValidator'

describe('prisonerNameValidator', () => {
  Array.of('John Smith', `David O'Leary`, `David O\`Leary`, `Trent Alexander-Arnold`).forEach(prisonerName => {
    it(`should validate given a valid prisoner name - ${prisonerName}`, () => {
      const errors = validatePrisonerName(prisonerName)

      expect(errors).toStrictEqual([])
    })
  })

  Array.of(null, undefined, '').forEach(prisonerName => {
    it(`should not validate given null/empty prisoner name - '${prisonerName}'`, () => {
      const errors = validatePrisonerName(prisonerName)

      expect(errors).toEqual(expect.arrayContaining([{ href: '#prisonerName', text: 'Enter a full name' }]))
    })
  })

  it(`should not validate a name that is too long'`, () => {
    const errors = validatePrisonerName('123456789 123456789 123456789 123456789 123456789 123456789 1')

    expect(errors).toEqual(
      expect.arrayContaining([{ href: '#prisonerName', text: 'Name can have a maximum length of 60 characters.' }])
    )
  })

  Array.of('1', '@', '1234ABC', 'AB1234A').forEach(prisonNumber => {
    it(`should not validate given invalid format prison number - '${prisonNumber}'`, () => {
      const errors = validatePrisonNumber(prisonNumber)

      expect(errors).toEqual(
        expect.arrayContaining([{ href: '#prisonNumber', text: 'Enter the prison number in the correct format.' }])
      )
    })
  })
})
