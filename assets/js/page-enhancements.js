/**
 * Script file to apply progressive enhancement techniques to page elements.
 * Any code here should be used only to enhance the page and UX if the user has JS enabled.
 *
 * If the user does not have JS enabled, or the code within this script does not run for some reason
 * the application should fall back to standard HTML functionality and should continue to operate.
 *
 * No code should be written here that renders a page non-functional if JS is not enabled or the script does not run/fails.
 */

;(autoFocusBarcodeField = ($, document) => {
  $(document).ready(() => {
    $('#scan-barcode-form #barcode').focus()
  })
})($, document)
;(autoFocusPrisonNumberField = ($, document) => {
  $(document).ready(() => {
    $('#find-recipient-by-prison-number-form #prisonNumber').focus()
  })
})($, document)
;(autoFocusPrisonNameField = ($, document) => {
  $(document).ready(() => {
    $('#create-new-contact-form #prisonerName').focus()
  })
})($, document)
;(convertPrisonDropdownToAutoComplete = ($, document) => {
  $(document).ready(() => {
    $('#create-new-contact-form select#prisonId').each((idx, element) => {
      accessibleAutocomplete.enhanceSelectElement({
        selectElement: element,
      })
    })
  })
})($, document)
;(enableCopyBarcodeButton = ($, document) => {
  $(document).ready(() => {
    if (typeof ClipboardItem !== 'function') {
      return
    }
    $('.barcode-address-copy-button')
      .css('display', 'inline-flex')
      .click(e => {
        const image = $(e.target).closest('div.barcode-address-container').find('img.barcode-address-image')[0]
        const canvas = document.createElement('canvas')
        // Note these are scaleFactor * CreateBarcodeController.canvasWidth / canvasHeight, which is required due to scaling
        canvas.width = 1012
        canvas.height = 392
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        }, 'image/png')
      })
  })
})($, document)
