/**
 * Script file to apply progressive enhancement techniques to page elements.
 * Any code here should be used only to enhance the page and UX if the user has JS enabled.
 *
 * If the user does not have JS enabled, or the code within this script does not run for some reason
 * the application should fall back to standard HTML functionality and should continue to operate.
 *
 * No code should be written here that renders a page non-functional if JS is not enabled ot the script does not run.
 */

;(autoFocusBarcodeField = ($, document) => {
  $(document).ready(() => {
    $('#scan-barcode-form #barcode').focus()
  })
})($, document)
