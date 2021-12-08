import { Request } from 'express'
import type { ManualEntryBarcodeForm } from 'forms'
import validate from './ManualEntryBarcodeFormValidator'

describe('ManualEntryBarcodeFormValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
    session: { manualEntryBarcodeForm: {} },
  } as Request

  it('should validate ManualEntryBarcodeForm with valid barcode elements', () => {
    const validForm = {
      barcodeElement1: '0123',
      barcodeElement2: '4567',
      barcodeElement3: '8901',
    } as ManualEntryBarcodeForm

    const valid = validate(validForm, req)

    expect(valid).toBe(true)
    expect(req.flash).not.toHaveBeenCalled()
  })

  describe('should not validate ManualEntryBarcodeForm with invalid barcode elements', () => {
    const invalidForms = Array.of(
      { description: 'All fields missing', form: {} },
      {
        description: 'A missing field',
        form: { barcodeElement1: '1234', barcodeElement2: '4567', barcodeElement3: undefined },
      },
      {
        description: 'An empty field',
        form: { barcodeElement1: '', barcodeElement2: '4567', barcodeElement3: '8901' },
      },
      {
        description: 'A non-numeric field',
        form: { barcodeElement1: 'ABCD', barcodeElement2: '4567', barcodeElement3: '8901' },
      },
      {
        description: 'A field without 4 digits',
        form: { barcodeElement1: '123', barcodeElement2: '4567', barcodeElement3: '8901' },
      },
      {
        description: 'A field with alpha-numerics',
        form: { barcodeElement1: '1234', barcodeElement2: 'a23!', barcodeElement3: '8901' },
      }
    )

    invalidForms.forEach(invalidForm => {
      it(`should not validate invalid ManualEntryBarcodeForm - ${invalidForm.description}`, () => {
        const valid = validate(invalidForm.form, req)

        expect(valid).toBe(false)
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#barcodeElement1', text: 'Enter the barcode number in the correct format' },
          { href: '#barcodeElement2' },
          { href: '#barcodeElement3' },
        ])
      })
    })
  })
})
