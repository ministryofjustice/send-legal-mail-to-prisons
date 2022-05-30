import type { EditContactForm } from 'forms'
import moment from 'moment'
import validatePrisonerName from '../validators/prisonerNameValidator'
import validatePrisonNumber from '../validators/prisonNumberValidator'
import validatePrisonId from '../validators/prisonIdValidator'
import validatePrisonerDob from '../validators/prisonerDobValidator'
import validateContact from './updateContactValidator'

jest.mock('../validators/prisonerNameValidator')
jest.mock('../validators/prisonNumberValidator')
jest.mock('../validators/prisonIdValidator')
jest.mock('../validators/prisonerDobValidator')

describe('updateContactValidator', () => {
  let mockValidatePrisonerName: jest.MockedFunction<typeof validatePrisonerName>
  let mockValidatePrisonNumber: jest.MockedFunction<typeof validatePrisonNumber>
  let mockValidatePrisonId: jest.MockedFunction<typeof validatePrisonId>
  let mockValidatePrisonerDob: jest.MockedFunction<typeof validatePrisonerDob>

  beforeEach(() => {
    mockValidatePrisonerName = validatePrisonerName as jest.MockedFunction<typeof validatePrisonerName>
    mockValidatePrisonNumber = validatePrisonNumber as jest.MockedFunction<typeof validatePrisonNumber>
    mockValidatePrisonId = validatePrisonId as jest.MockedFunction<typeof validatePrisonId>
    mockValidatePrisonerDob = validatePrisonerDob as jest.MockedFunction<typeof validatePrisonerDob>
  })

  const form = {
    prisonerName: 'some-name',
    prisonNumber: 'some-prison-number',
    prisonId: 'some-prison-id',
    dob: moment('1990-01-01', 'YYYY-MM-DD').toDate(),
    'dob-day': '1',
    'dob-month': '1',
    'dob-year': '1990',
  } as EditContactForm

  it('should return no errors if valid', () => {
    mockValidatePrisonerName.mockReturnValue([])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateContact(form)).toEqual([])
  })

  it('should return name errors', () => {
    mockValidatePrisonerName.mockReturnValue(['some-name-error'])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateContact(form)).toEqual([{ href: '#prisonerName', text: 'some-name-error' }])
  })

  it('should return prison number errors', () => {
    mockValidatePrisonerName.mockReturnValue([])
    mockValidatePrisonNumber.mockReturnValue(['some-prison-number-error'])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateContact(form)).toEqual([{ href: '#prisonNumber', text: 'some-prison-number-error' }])
  })

  it('should return prison id errors', () => {
    mockValidatePrisonerName.mockReturnValue([])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue(['some-prison-id-error'])
    mockValidatePrisonerDob.mockReturnValue([])

    expect(validateContact(form)).toEqual([{ href: '#prisonId', text: 'some-prison-id-error' }])
  })

  it('should return dob errors', () => {
    mockValidatePrisonerName.mockReturnValue([])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue(['some-dob-error'])

    expect(validateContact(form)).toEqual([{ href: '#dob-day', text: 'some-dob-error' }])
  })

  it('should return multiple errors', () => {
    mockValidatePrisonerName.mockReturnValue(['some-name-error'])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue(['some-dob-error'])

    expect(validateContact(form)).toEqual([
      { href: '#prisonerName', text: 'some-name-error' },
      { href: '#dob-day', text: 'some-dob-error' },
    ])
  })

  it('should require one of prison numbeer or dob', () => {
    mockValidatePrisonerName.mockReturnValue([])
    mockValidatePrisonNumber.mockReturnValue([])
    mockValidatePrisonId.mockReturnValue([])
    mockValidatePrisonerDob.mockReturnValue([])

    const invalidForm: EditContactForm = { ...form, prisonNumber: undefined, dob: undefined }

    expect(validateContact(invalidForm)).toEqual([
      { href: '#prisonNumber', text: 'Enter at least one of prison number or date of birth' },
    ])
  })
})
