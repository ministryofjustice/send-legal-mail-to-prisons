import validatePrisonNumber from './prisonNumberValidator'

describe('prisonNumberValidator', () => {
  it('should validate given a valid prison number', () => {
    const errors = validatePrisonNumber('A1234BC')

    expect(errors).toStrictEqual([])
  })

  Array.of(null, undefined, '').forEach(prisonNumber => {
    it(`should not validate given null/empty prison number - '${prisonNumber}'`, () => {
      const errors = validatePrisonNumber(prisonNumber)

      expect(errors).toEqual(expect.arrayContaining([{ href: '#prisonNumber', text: 'Enter a prison number' }]))
    })
  })

  Array.of('blah', 'A 1234 BC', '1234ABC', 'AB1234A').forEach(prisonNumber => {
    it(`should not validate given invalid format prison number - '${prisonNumber}'`, () => {
      const errors = validatePrisonNumber(prisonNumber)

      expect(errors).toEqual(
        expect.arrayContaining([{ href: '#prisonNumber', text: 'Enter the prison number in the correct format.' }])
      )
    })
  })
})
