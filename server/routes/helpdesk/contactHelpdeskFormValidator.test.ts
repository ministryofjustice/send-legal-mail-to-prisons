import type { ContactHelpdeskForm } from 'forms'
import validateName from './validators/nameValidator'
import validateEmail from './validators/emailValidator'
import validateProblemDetail from './validators/problemDetailValidator'
import validateUpload from './validators/uploadValidator'
import validate from './contactHelpdeskFormValidator'

jest.mock('./validators/nameValidator')
jest.mock('./validators/emailValidator')
jest.mock('./validators/uploadValidator')
jest.mock('./validators/problemDetailValidator')

describe('contactHelpdeskFormValidator', () => {
  let mockValidateName: jest.MockedFunction<typeof validateName>
  let mockValidateEmail: jest.MockedFunction<typeof validateEmail>
  let mockValidateUpload: jest.MockedFunction<typeof validateUpload>
  let mockValidateProblemDetail: jest.MockedFunction<typeof validateProblemDetail>

  beforeEach(() => {
    mockValidateName = validateName as jest.MockedFunction<typeof validateName>
    mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>
    mockValidateUpload = validateUpload as jest.MockedFunction<typeof validateUpload>
    mockValidateProblemDetail = validateProblemDetail as jest.MockedFunction<typeof validateProblemDetail>
  })

  const form = {
    pageId: 'review-recipients',
    name: 'Albert Einstein',
    email: 'albert@aardvark.com',
    problemDetail: 'Bad things happened',
  } as ContactHelpdeskForm

  const upload = {
    size: 1234,
    path: '/uploads/file-abc',
  } as Express.Multer.File

  it('should return no errors if valid', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue([])
    mockValidateUpload.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form, upload)).toEqual([])
  })

  it('should return name errors', () => {
    mockValidateName.mockReturnValue(['Enter a full name'])
    mockValidateEmail.mockReturnValue([])
    mockValidateUpload.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form, upload)).toEqual([{ href: '#name', text: 'Enter a full name' }])
  })

  it('should return email address errors', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue(['Enter an email address'])
    mockValidateUpload.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form, upload)).toEqual([{ href: '#email', text: 'Enter an email address' }])
  })

  it('should return file upload errors', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue([])
    mockValidateUpload.mockReturnValue(['The selected file must be smaller than 20MB'])
    mockValidateProblemDetail.mockReturnValue([])

    expect(validate(form, upload)).toEqual([
      { href: '#screenshot', text: 'The selected file must be smaller than 20MB' },
    ])
  })

  it('should return problem detail errors', () => {
    mockValidateName.mockReturnValue([])
    mockValidateEmail.mockReturnValue([])
    mockValidateUpload.mockReturnValue([])
    mockValidateProblemDetail.mockReturnValue(['Enter details of the problem you experienced'])

    expect(validate(form, upload)).toEqual([
      { href: '#problemDetail', text: 'Enter details of the problem you experienced' },
    ])
  })

  it('should return all errors', () => {
    mockValidateName.mockReturnValue(['Enter a full name'])
    mockValidateEmail.mockReturnValue(['Enter an email address'])
    mockValidateUpload.mockReturnValue(['The selected file must be smaller than 20MB'])
    mockValidateProblemDetail.mockReturnValue(['Enter details of the problem you experienced'])

    expect(validate(form, upload)).toEqual([
      { href: '#problemDetail', text: 'Enter details of the problem you experienced' },
      { href: '#screenshot', text: 'The selected file must be smaller than 20MB' },
      { href: '#name', text: 'Enter a full name' },
      { href: '#email', text: 'Enter an email address' },
    ])
  })
})
