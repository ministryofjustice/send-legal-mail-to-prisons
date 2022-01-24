import validateBarcodeOption from './barcodeOptionValidator'

describe('barcodeOptionValidator', () => {
  const req = {
    flash: jest.fn(),
    body: { barcodeOption: undefined as string },
  }

  afterEach(() => {
    req.flash.mockReset()
    req.body = { barcodeOption: undefined as string }
  })

  it('should reject missing value', () => {
    const errors = validateBarcodeOption('')

    expect(errors).toStrictEqual(['Select an option'])
  })

  it('should reject invalid value', () => {
    const errors = validateBarcodeOption('invalid-value')

    expect(errors).toStrictEqual(['Select an option'])
  })

  Array.of({ barcodeOption: 'image' }, { barcodeOption: 'coversheet' }).forEach(body => {
    it(`should accept value - ${body.barcodeOption}`, () => {
      const errors = validateBarcodeOption(body.barcodeOption)

      expect(errors).toStrictEqual([])
    })
  })
})
