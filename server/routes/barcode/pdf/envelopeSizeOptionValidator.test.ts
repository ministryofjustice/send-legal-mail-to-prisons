import validateEnvelopeSizeOption from './envelopeSizeOptionValidator'

describe('envelopeSizeValidator', () => {
  const req = {
    flash: jest.fn(),
    body: { envelopeSize: undefined as string },
  }

  afterEach(() => {
    req.flash.mockReset()
    req.body = { envelopeSize: undefined as string }
  })

  it('should reject missing value', () => {
    const errors = validateEnvelopeSizeOption(undefined)

    expect(errors).toStrictEqual(['Select an option'])
  })

  it('should reject invalid value', () => {
    const errors = validateEnvelopeSizeOption('invalid-value')

    expect(errors).toStrictEqual(['Select an option'])
  })

  Array.of({ envelopeSize: 'c5' }, { envelopeSize: 'c4' }, { envelopeSize: 'dl' }).forEach(body => {
    it(`should accept value - ${body.envelopeSize}`, () => {
      const errors = validateEnvelopeSizeOption(body.envelopeSize)

      expect(errors).toStrictEqual([])
    })
  })
})
