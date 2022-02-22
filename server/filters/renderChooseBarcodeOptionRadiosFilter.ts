import type { RadioButtonOption } from 'forms'

export default function renderChooseBarcodeOptionRadiosFilter(values: Array<string>): Array<RadioButtonOption> {
  return [
    {
      value: 'image',
      html: `<p>Print as part of your own document.</p>
<div>
  <img src="/assets/images/print-barcodes-image.png" alt="An example of a letter containing the copied image"/>
</div>
<div>
  <details class="govuk-details" data-module="govuk-details">
    <summary class="govuk-details__summary"><span class="govuk-details__summary-text">How it works</span></summary>
    <div class="govuk-details__text govuk-!-display-inline-block">
      <span class="govuk-grid-column-one-third">
        <img src="/assets/images/copy-barcode-how-it-works-1.png" alt="An example of the first copy image instruction"/>
        <p>1. You’ll get an image of the barcode and address - copy or download it.</p>
      </span>
      <span class="govuk-grid-column-one-third">
        <img src="/assets/images/copy-barcode-how-it-works-2.png" alt="An example of the second copy image instruction"/>
        <p>2. Paste or insert the image into your own document.</p>
      </span>
      <span class="govuk-grid-column-one-third">
        <img src="/assets/images/copy-barcode-how-it-works-3.png" alt="An example of the third copy image instruction"/>
        <p>3. Print your document.</p>
      </span>
    </div>
  </details>
</div>`,
      checked: false,
    },
    {
      value: 'coversheet',
      html: `<p>Print on a separate piece of paper.</p>
<div>
  <img src='/assets/images/print-barcodes-coversheet.png' alt='An example of a separate printed sheet'/>
</div>
<div>
  <details class='govuk-details' data-module='govuk-details'>
    <summary class='govuk-details__summary'><span class='govuk-details__summary-text'>How it works</span></summary>
    <div class='govuk-details__text govuk-!-display-inline-block'>
      <span class='govuk-grid-column-one-third'>
        <img src='/assets/images/coversheet-how-it-works-1.png' alt='An example of the first coversheet instruction'/>
        <p>1. Choose your envelope size.</p>
      </span>
      <span class='govuk-grid-column-one-third'>
        <img src='/assets/images/coversheet-how-it-works-2.png' alt='An example of the second coversheet instruction'/>
        <p>2. Download the coversheet with the barcode and address positioned correctly.</p>
      </span>
      <span class='govuk-grid-column-one-third'>
        <img src='/assets/images/coversheet-how-it-works-3.png' alt='An example of the third coversheet instruction'/>
        <p>3. Print your coversheet.</p>
      </span>
    </div>
  </details>
</div>`,
      checked: false,
    },
  ].filter(option => values.includes(option.value))
}
