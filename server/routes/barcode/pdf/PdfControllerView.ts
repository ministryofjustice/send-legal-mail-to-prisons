import type { PdfForm } from 'forms'

export type EnvelopeSizeSpec = {
  key: string
  label: string
  description: string
  width: number
  height: number
}
export const ENVELOPE_SIZES: Array<EnvelopeSizeSpec> = [
  { key: 'dl', label: 'DL', description: 'A4 folded in thirds', width: 220, height: 110 },
  { key: 'c5', label: 'C5', description: 'A4 folded in half or A5 not folded', width: 229, height: 162 },
  { key: 'c4', label: 'C4', description: 'A4 not folded', width: 229, height: 324 },
]

export default class PdfControllerView {
  constructor(
    private readonly pdfForm: PdfForm,
    private readonly smokeTestBarcode: string,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: PdfForm
    errors: Array<Record<string, string>>
    envelopeSizes: Array<EnvelopeSizeSpec>
    smokeTestBarcode: string
  } {
    return {
      form: this.pdfForm,
      errors: this.errors || [],
      envelopeSizes: ENVELOPE_SIZES,
      smokeTestBarcode: this.smokeTestBarcode,
    }
  }
}
