import validatePrisonerDob from './prisonerDobValidator'

describe('prisonerDobValidator', () => {
  it('should validate a valid date of birth', () => {
    const errors = validatePrisonerDob('01-01-1990')

    expect(errors).toStrictEqual([])
  })

  it('should validate a missing date of birth', () => {
    const errors = validatePrisonerDob()

    expect(errors).toStrictEqual(['Enter a date of birth'])
  })

  it('should validate an invalid date of birth', () => {
    const errors = validatePrisonerDob('42-01-1990')

    expect(errors).toStrictEqual(['Enter a date of birth in the correct format'])
  })

  it('should validate a future date of birth', () => {
    const errors = validatePrisonerDob('01-01-2190')

    expect(errors).toStrictEqual(['Enter a date of birth in the past'])
  })
})
