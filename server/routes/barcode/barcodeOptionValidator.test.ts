import { Request } from 'express'
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
    const valid = validateBarcodeOption(req as unknown as Request)

    expect(valid).toBeFalsy()
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#barcodeOption', text: 'Select an option' }])
  })

  it('should reject invalid value', () => {
    req.body.barcodeOption = 'invalid-value'

    const valid = validateBarcodeOption(req as unknown as Request)

    expect(valid).toBeFalsy()
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#barcodeOption', text: 'Select an option' }])
  })

  Array.of({ barcodeOption: 'image' }, { barcodeOption: 'coversheet' }).forEach(body => {
    it('should accept value', () => {
      req.body.barcodeOption = body.barcodeOption
      const valid = validateBarcodeOption(req as unknown as Request)

      expect(valid).toBeTruthy()
    })
  })
})
