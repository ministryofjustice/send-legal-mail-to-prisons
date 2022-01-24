import type { CreateNewContactByPrisonerNameForm } from 'forms'
import validatePrisonId from '../validators/prisonIdValidator'
import validatePrisonerDob from '../validators/prisonerDobValidator'
import validateNewContactByPrisonerName from './newContactByPrisonerNameValidator'

jest.mock('../validators/prisonerDobValidator')
jest.mock('../validators/prisonIdValidator')

describe('newContactValidator', () => {
  let mockValidatePrisonerDob: jest.MockedFunction<typeof validatePrisonerDob>
  let mockValidatePrisonId: jest.MockedFunction<typeof validatePrisonId>

  beforeEach(() => {
    mockValidatePrisonerDob = validatePrisonerDob as jest.MockedFunction<typeof validatePrisonerDob>
    mockValidatePrisonId = validatePrisonId as jest.MockedFunction<typeof validatePrisonId>
  })

  const form = { prisonerName: 'name', prisonId: 'id', prisonerDob: 'dob' } as CreateNewContactByPrisonerNameForm

  it('should return no errors if valid', () => {
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateNewContactByPrisonerName(form)).toEqual([])
  })

  it('should return prison id errors', () => {
    mockValidatePrisonId.mockReturnValue(['Select a prison name'])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateNewContactByPrisonerName(form)).toEqual([{ href: '#prisonId', text: 'Select a prison name' }])
  })

  it('should return prisoner dob errors', () => {
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue(['Enter a date of birth'])

    expect(validateNewContactByPrisonerName(form)).toEqual([{ href: '#prisonerDob', text: 'Enter a date of birth' }])
  })

  it('should return all errors', () => {
    mockValidatePrisonId.mockReturnValue(['Select a prison name'])
    mockValidatePrisonerDob.mockReturnValue(['Enter a date of birth'])

    expect(validateNewContactByPrisonerName(form)).toEqual(
      expect.arrayContaining([
        { href: '#prisonId', text: 'Select a prison name' },
        { href: '#prisonerDob', text: 'Enter a date of birth' },
      ])
    )
  })
})
