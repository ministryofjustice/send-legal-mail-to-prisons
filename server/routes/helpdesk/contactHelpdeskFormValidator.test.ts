import type { ContactHelpdeskForm } from 'forms'
import validateName from './validators/nameValidator'
import validateEmail from './validators/emailValidator'
import validateProblemDetail from './validators/problemDetailValidator'
import validate from './contactHelpdeskFormValidator'

jest.mock('./validators/nameValidator')
jest.mock('./validators/emailValidator')
jest.mock('./validators/problemDetailValidator')

describe('contactHelpdeskFormValidator', () => {
  let mockValidateName: jest.MockedFunction<typeof validateName>
  let mockValidateEmail: jest.MockedFunction<typeof validateEmail>
  let mockValidateProblemDetail: jest.MockedFunction<typeof validateProblemDetail>

  beforeEach(() => {
    mockValidateName = validateName as jest.MockedFunction<typeof validateName>
    mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>
    mockValidateProblemDetail = validateProblemDetail as jest.MockedFunction<typeof validateProblemDetail>
  })

  const form = {
    pageId: 'review-recipients',
    name: 'Albert Einstein',
    email: 'albert@aardvark.com',
    problemDetail: 'Bad things happened',
  } as ContactHelpdeskForm

  it('should return no errors if valid', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form)).toEqual([])
  })

  it('should return name errors', () => {
    mockValidateName.mockReturnValue(['Enter a full name'])
    mockValidateEmail.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form)).toEqual([{ href: '#name', text: 'Enter a full name' }])
  })

  it('should return email address errors', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue(['Enter an email address'])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form)).toEqual([{ href: '#email', text: 'Enter an email address' }])
  })

  it('should return problem detail errors', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue(['Enter details of the problem you experienced'])

    expect(validate(form)).toEqual([{ href: '#problemDetail', text: 'Enter details of the problem you experienced' }])
  })

  it('should return all errors', () => {
    mockValidateName.mockReturnValue(['Enter a full name'])
    mockValidateEmail.mockReturnValue(['Enter an email address'])
    mockValidateProblemDetail.mockReturnValue(['Enter details of the problem you experienced'])

    expect(validate(form)).toEqual([
      { href: '#problemDetail', text: 'Enter details of the problem you experienced' },
      { href: '#name', text: 'Enter a full name' },
      { href: '#email', text: 'Enter an email address' },
    ])
  })
})
