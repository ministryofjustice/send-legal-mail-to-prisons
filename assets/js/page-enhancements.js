/**
 * Script file to apply progressive enhancement techniques to page elements.
 * Any code here should be used only to enhance the page and UX if the user has JS enabled.
 *
 * If the user does not have JS enabled, or the code within this script does not run for some reason
 * the application should fall back to standard HTML functionality and should continue to operate.
 *
 * No code should be written here that renders a page non-functional if JS is not enabled or the script does not run/fails.
 */
window.pageEnhancements = (($, document) => {
  const convertPrisonDropdownToAutoComplete = () => {
    // get the prison names
    const prisonNames = $('select#prisonId option')
      .toArray()
      .map(option => option.text)
      .filter(prisonName => prisonName !== '')
    if (prisonNames.length === 0) {
      return
    }
    function suggest(query, populateResults) {
      const queryWords = query.toLowerCase().split(' ')
      // find all matching prisons for each query word
      const queryWordsMatches = queryWords.flatMap(queryWord =>
        prisonNames.filter(option => option.toLowerCase().indexOf(queryWord) !== -1)
      )
      // Reduce to a map of matching prison names and their counts
      const prisonNameCounts = queryWordsMatches.reduce((counts, prisonName) => {
        return (counts[prisonName] = (counts[prisonName] || 0) + 1), counts
      }, {})
      // sort the matching options by highest count first
      const sortedMatchingPrisonNames = Object.keys(prisonNameCounts).sort((a, b) => {
        return prisonNameCounts[b] - prisonNameCounts[a]
      })
      populateResults(sortedMatchingPrisonNames)
    }
    $('select#prisonId').each((idx, element) => {
      accessibleAutocomplete.enhanceSelectElement({
        selectElement: element,
        source: suggest,
      })
    })
    $('#prisonId')
      .closest('form')
      .submit(event => {
        // Before submitting the form set the prisonId select option to the value matching the autocomplete, or the null option if there is no match
        // This is because the autocomplete currently only sets the select option when there is a valid match, which causes incorrect
        // behaviour when the user performs a valid autocomplete, then changes it to blank or non-matching text. In this case the underlying
        // select is not reset so we have to do it ourselves.
        event.preventDefault()
        const underlyingSelectField = $('#prisonId-select')
        const autoCompleteField = $('#prisonId')
        // In all cases start off by setting the underlying select option to the null/empty option
        underlyingSelectField.children(`option[value='']`).prop('selected', true)
        // Now find the option whose text matches the autocomplete field, and select it. If there is no match nothing will be selected
        underlyingSelectField
          .children('option')
          .filter((idx, option) => option.text === autoCompleteField.val())
          .prop('selected', true)
        // Submit the form
        event.target.submit()
      })
  }

  const enableCopyBarcodeButton = () => {
    if (typeof ClipboardItem !== 'function') {
      return
    }
    $('.barcode-address-copy-button')
      .css('display', 'inline-flex')
      .click(event => {
        const container = $(event.target).closest('div.barcode-address-container')
        const image = container.find('img.barcode-address-image')[0]
        const canvas = document.createElement('canvas')
        // Note these are scaleFactor * CreateBarcodeController.canvasWidth / canvasHeight, which is required due to scaling
        canvas.width = 1012
        canvas.height = 392
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])

          const feedbackContainer = container.find('div.copy-barcode-feedback-container')
          const feedbackContent = feedbackContainer.find('span')
          feedbackContent.text('')
          feedbackContainer.show()
          feedbackContent.html('Copied barcode')
        }, 'image/png')
      })
  }

  const autoDownloadCoversheetPdf = () => {
    setTimeout(() => {
      $('#print-coversheets-content #downloadPdf').each((idx, element) => element.click())
    }, 1000)
  }

  const autoFocusBarcodeField = () => {
    $('#scan-barcode-form #barcode').trigger('focus')
  }

  const extractCsrfFieldAsKeyValuePairFromForm = form => {
    return form
      .serializeArray()
      .filter(formField => formField.name === '_csrf')
      .map(formField => {
        return `${formField.name}=${formField.value}`
      })
  }

  const submitCookiePreferencesFormViaAjax = () => {
    $('#cookiePreferencesForm button[type=submit]').on('click', function (event) {
      event.preventDefault()
      const form = $(this).closest('form')
      const csrfQueryString = extractCsrfFieldAsKeyValuePairFromForm(form)
      const formAction = `${form.attr('action')}?${csrfQueryString}`
      const data = {}
      data[this.name] = this.value

      $.ajax(formAction, { contentType: 'application/json', method: 'POST', data: JSON.stringify(data) }).done(
        response => {
          const returnedPartial = response.partial
          form.after(returnedPartial)
          // setup the new content just inseted into the DOM to be submitted via ajax
          submitCookiePreferenceConfirmationFormViaAjax()
          form.remove()
          // Use browser history API to change to URL to add the query string param (which would otherwise be set server side in a non-ajax request)
          const urlWithQuerystringParam = window.location.pathname + '?showCookieConfirmation=true'
          history.pushState(null, '', urlWithQuerystringParam)
        }
      )
    })
  }

  const submitCookiePreferenceConfirmationFormViaAjax = () => {
    $('#cookiePreferenceConfirmationForm button[type=submit]').on('click', function (event) {
      event.preventDefault()
      const form = $(this).closest('form')
      const csrfQueryString = extractCsrfFieldAsKeyValuePairFromForm(form)
      const formAction = `${form.attr('action')}?${csrfQueryString}`
      $.ajax(formAction, { contentType: 'application/json', method: 'POST' })
      form.remove()
      // Use browser history API to change to URL to remove the query string param (which would otherwise be set server side in a non-ajax request)
      const urlWithoutQuerystringParam = window.location.pathname
      history.pushState(null, '', urlWithoutQuerystringParam)
    })
  }

  const pushGtmBarcodeCount = () => {
    const barcodeCreateCount = $('#barcode-created-count').attr('data-value')
    if (barcodeCreateCount) {
      window.dataLayer.push({
        barcodesCreatedCount: barcodeCreateCount,
      })
    }
  }

  return {
    init: () => {
      $(() => {
        convertPrisonDropdownToAutoComplete()
        enableCopyBarcodeButton()
        autoDownloadCoversheetPdf()
        autoFocusBarcodeField()
        submitCookiePreferencesFormViaAjax()
        submitCookiePreferenceConfirmationFormViaAjax()
        pushGtmBarcodeCount()
      })
    },
  }
})($, document)

window.pageEnhancements.init()
