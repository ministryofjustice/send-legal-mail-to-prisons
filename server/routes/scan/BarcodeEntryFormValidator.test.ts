import { Request } from 'express'
import type { BarcodeEntryForm } from 'forms'
import validate from './BarcodeEntryFormValidator'

describe('BarcodeEntryFormValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
    session: { barcodeEntryForm: {} },
  } as Request

  it('should validate BarcodeEntryForm with valid barcode', () => {
    const validForm = {
      barcode: '123456789012',
    } as BarcodeEntryForm

    const valid = validate(validForm, req)

    expect(valid).toBe(true)
    expect(req.flash).not.toHaveBeenCalled()
  })

  describe('should not validate BarcodeEntryForm with invalid barcodes', () => {
    const invalidForms = Array.of(
      {
        description: 'Barcode field containing 11 digits',
        form: { barcode: '12345678901' },
      },
      {
        description: 'Barcode field containing 13 digits',
        form: { barcode: '1234567890123' },
      },
      {
        description: 'Barcode field containing non-numerics',
        form: { barcode: '1234ABCD5678' },
      },
      {
        description: 'Barcode field containing special characters',
        form: { barcode: '1234!@£$5678' },
      }
    )

    invalidForms.forEach(invalidForm => {
      it(`should not validate invalid BarcodeEntryForm - ${invalidForm.description}`, () => {
        const valid = validate(invalidForm.form, req)

        expect(valid).toBe(false)
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#barcode', text: 'Enter a barcode number which is 12 digits long.' },
        ])
      })
    })
  })

  describe('should not validate BarcodeEntryForm with empty barcodes', () => {
    const invalidForms = Array.of(
      { description: 'Barcode field missing', form: {} },
      {
        description: 'Barcode field empty',
        form: { barcode: '' },
      }
    )

    invalidForms.forEach(invalidForm => {
      it(`should not validate invalid BarcodeEntryForm - ${invalidForm.description}`, () => {
        const valid = validate(invalidForm.form, req)

        expect(valid).toBe(false)
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#barcode', text: 'Enter a barcode number.' }])
      })
    })
  })
})
