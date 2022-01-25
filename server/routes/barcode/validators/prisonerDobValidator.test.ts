import moment from 'moment'
import validatePrisonerDob from './prisonerDobValidator'

describe('prisonerDobValidator', () => {
  it('should validate a valid date of birth', () => {
    const errors = validatePrisonerDob(moment('01-01-1990', 'DD-MM-YYYY', true).toDate())

    expect(errors).toStrictEqual([])
  })

  it('should validate a missing date of birth', () => {
    const errors = validatePrisonerDob()

    expect(errors).toStrictEqual(['Enter a date of birth'])
  })

  it('should validate an invalid date of birth', () => {
    const errors = validatePrisonerDob(new Date(NaN))

    expect(errors).toStrictEqual(['Enter a date of birth in the correct format'])
  })

  it('should validate a future date of birth', () => {
    const errors = validatePrisonerDob(moment('01-01-2190', 'DD-MM-YYYY', true).toDate())

    expect(errors).toStrictEqual(['Enter a date of birth in the past'])
  })
})
