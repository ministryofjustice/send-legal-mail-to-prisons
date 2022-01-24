import validatePrisonId from './prisonIdValidator'

describe('prisonIdValidator', () => {
  it('should validate given a valid prison id', () => {
    const errors = validatePrisonId('SKI')

    expect(errors).toStrictEqual([])
  })

  Array.of(null, undefined, '').forEach(prisonId => {
    it(`should not validate given null/empty prison id - '${prisonId}'`, () => {
      const errors = validatePrisonId(prisonId)

      expect(errors).toEqual(expect.arrayContaining(['Select a prison name']))
    })
  })
})
