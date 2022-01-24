import type { CreateNewContactForm } from 'forms'
import validateNewContact from './newContactValidator'
import validatePrisonerName from './prisonerNameValidator'
import validatePrisonId from './prisonIdValidator'

jest.mock('./prisonerNameValidator')
jest.mock('./prisonIdValidator')

describe('newContactValidator', () => {
  let mockValidatePrisonerName: jest.MockedFunction<typeof validatePrisonerName>
  let mockValidatePrisonId: jest.MockedFunction<typeof validatePrisonId>

  beforeEach(() => {
    mockValidatePrisonerName = validatePrisonerName as jest.MockedFunction<typeof validatePrisonerName>
    mockValidatePrisonId = validatePrisonId as jest.MockedFunction<typeof validatePrisonId>
  })

  const form = { prisonNumber: 'A1234BC', prisonerName: 'name', prisonId: 'id' } as CreateNewContactForm

  it('should return no errors if valid', () => {
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerName.mockReturnValue([])

    expect(validateNewContact(form)).toEqual([])
  })

  it('should return prison id errors', () => {
    mockValidatePrisonId.mockReturnValue(['Select a prison name'])
    mockValidatePrisonerName.mockReturnValue([])

    expect(validateNewContact(form)).toEqual([{ href: '#prisonId', text: 'Select a prison name' }])
  })

  it('should return prisoner name errors', () => {
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerName.mockReturnValue(['Enter a full name'])

    expect(validateNewContact(form)).toEqual([{ href: '#prisonerName', text: 'Enter a full name' }])
  })

  it('should return all errors', () => {
    mockValidatePrisonId.mockReturnValue(['Select a prison name'])
    mockValidatePrisonerName.mockReturnValue(['Enter a full name'])

    expect(validateNewContact(form)).toEqual(
      expect.arrayContaining([
        { href: '#prisonId', text: 'Select a prison name' },
        { href: '#prisonerName', text: 'Enter a full name' },
      ])
    )
  })
})
