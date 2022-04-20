import type { RadioButtonOption } from 'forms'

export default function renderChooseBarcodeOptionRadiosFilter(values: Array<string>): Array<RadioButtonOption> {
  return [
    {
      value: 'image',
      text: 'Print as part of your own document.',
      hint: {
        html: `        
          <img src='/assets/images/print-barcodes-image.png' alt='Illustration showing the location of the barcode in the top left corner when inserted into a document' width='94px'/>
          <details class='govuk-details' data-module='govuk-details'>
            <summary class='govuk-details__summary'><span class='govuk-details__summary-text'>How it works</span></summary>            
            <div class="govuk-details__text">
              <ol class="govuk-grid-row">
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/copy-barcode-how-it-works-1.png" width="141px" alt="Illustration showing the barcode image on a computer screen">
                  <div>
                    <span>1. </span>You'll get an image of the barcode and address - copy or download it.
                  </div>
                </li>
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/copy-barcode-how-it-works-2.png" width="141px" alt="Illustration showing a letter without the barcode and address, and then with the barcode and address pasted in, on a computer screen">
                  <div>
                    <span>2. </span> Paste or insert the image into your own document.
                  </div>
                </li>
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/copy-barcode-how-it-works-3.png" width="141px" alt="Illustration of a letter with the barcode and address on it being printed">
                  <div>
                    <span>3. </span> Print your document.
                  </div>
                </li>
              </ol>
            </div>
        `,
      },
      checked: false,
    },
    {
      value: 'coversheet',
      text: 'Print on a separate piece of paper.',
      hint: {
        html: `
          <img src='/assets/images/print-barcodes-coversheet.png' alt='Illustration showing a plain document with a barcode and address in the top left corner' width='94px'/>
          <details class='govuk-details' data-module='govuk-details'>
            <summary class='govuk-details__summary'><span class='govuk-details__summary-text'>How it works</span></summary>            
            <div class="govuk-details__text">
              <ol class="govuk-grid-row">
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/coversheet-how-it-works-1.png" width="141px" alt="Illustration showing 3 different sizes of envelope on a computer screen">
                  <div>
                    <span>1. </span>Choose your envelope size.
                  </div>
                </li>
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/coversheet-how-it-works-2.png" width="141px" alt="Illustration showing a plain document with the barcode and address inserted in the top left corner on a computer screen">
                  <div>
                    <span>2. </span> Download the coversheet with the barcode and address positioned correctly.
                  </div>
                </li>
                <li class="govuk-grid-column-one-third">
                  <img src="/assets/images/coversheet-how-it-works-3.png" width="141px" alt="Illustration of a plain document with the barcode on it being printed">
                  <div>
                    <span>3. </span> Print your coversheet.
                  </div>
                </li>
              </ol>
            </div>
        `,
      },
      checked: false,
    },
  ].filter(option => values.includes(option.value))
}
