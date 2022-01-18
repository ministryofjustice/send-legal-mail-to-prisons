import { Request } from 'express'
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
    const valid = validateEnvelopeSizeOption(req as unknown as Request)

    expect(valid).toBeFalsy()
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#envelopeSize', text: 'Select an option' }])
  })

  it('should reject invalid value', () => {
    req.body.envelopeSize = 'invalid-value'

    const valid = validateEnvelopeSizeOption(req as unknown as Request)

    expect(valid).toBeFalsy()
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#envelopeSize', text: 'Select an option' }])
  })

  Array.of({ envelopeSize: 'c5' }, { envelopeSize: 'c4' }, { envelopeSize: 'dl' }).forEach(body => {
    it(`should accept value - ${body.envelopeSize}`, () => {
      req.body.envelopeSize = body.envelopeSize
      const valid = validateEnvelopeSizeOption(req as unknown as Request)

      expect(valid).toBeTruthy()
    })
  })
})
