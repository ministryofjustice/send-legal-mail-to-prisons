import validateUpload from './uploadValidator'

describe('uploadValidator', () => {
  it(`should validate given no uploaded file`, () => {
    const upload: Express.Multer.File = null

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual([])
  })

  it(`should validate given a valid uploaded file`, () => {
    const upload = {
      size: 1,
      mimetype: 'image/jpg',
    } as Express.Multer.File

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual([])
  })

  it(`should validate given an empty uploaded file`, () => {
    const upload = {
      size: 0,
      mimetype: 'image/jpg',
    } as Express.Multer.File

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual(['The selected file cannot be empty'])
  })

  it(`should validate given an uploaded file that is too big`, () => {
    const upload = {
      size: 20 * 1024 * 1024 + 1,
      mimetype: 'image/jpg',
    } as Express.Multer.File

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual(['The selected file must be smaller than 20MB'])
  })

  it(`should validate given an unsupported file type`, () => {
    const upload = {
      size: 20,
      mimetype: 'application/octet-stream',
    } as Express.Multer.File

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual(['The selected file must be a JPG, JPEG, BMP, PNG, TIF, or PDF'])
  })

  it(`should validate given an unsupported file type that is also too large`, () => {
    const upload = {
      size: 20 * 1024 * 1024 + 1,
      mimetype: 'application/octet-stream',
    } as Express.Multer.File

    const errors = validateUpload(upload)

    expect(errors).toStrictEqual([
      'The selected file must be smaller than 20MB',
      'The selected file must be a JPG, JPEG, BMP, PNG, TIF, or PDF',
    ])
  })
})
