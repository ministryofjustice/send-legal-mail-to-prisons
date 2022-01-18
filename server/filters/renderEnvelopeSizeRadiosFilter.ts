import type { RadioButtonOption } from 'forms'
import { EnvelopeSizeSpec } from '../routes/barcode/PdfControllerView'

export default function renderEnvelopeSizeRadiosFilter(
  envelopeSizes: Array<EnvelopeSizeSpec>
): Array<RadioButtonOption> {
  return envelopeSizes.map(envelopeSize => {
    return {
      value: envelopeSize.key,
      html: `<div class='${envelopeSize.key}'>
  <span class='label'>${envelopeSize.label}</span>
  <span class='description'>(${envelopeSize.description})</span>
  <span class='specification'>Width: ${envelopeSize.width}mm, height: ${envelopeSize.height}mm</span>
</div>`,
      checked: false,
    }
  })
}
