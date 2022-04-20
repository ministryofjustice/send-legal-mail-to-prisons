import type { RadioButtonOption } from 'forms'
import { EnvelopeSizeSpec } from '../routes/barcode/pdf/PdfControllerView'

export default function renderEnvelopeSizeRadiosFilter(
  envelopeSizes: Array<EnvelopeSizeSpec>
): Array<RadioButtonOption> {
  return envelopeSizes.map(envelopeSize => {
    return {
      value: envelopeSize.key,
      html: `<strong>${envelopeSize.label}</strong>`,
      hint: {
        html: `
          ${envelopeSize.description}.<br/>
          Width: ${envelopeSize.width}mm; height: ${envelopeSize.height}mm
          <img src="/assets/images/envelope-size-${envelopeSize.key}.png" width="115px" alt/>          
        `,
      },
      checked: false,
    }
  })
}
