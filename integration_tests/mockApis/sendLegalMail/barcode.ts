import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import barcodes from '../barcodes'

const stubVerifyValidBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.VALID_BARCODE}")]` }],
      headers: {
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        createdBy: 'Aardvark Lawyers',
      },
    },
  })

const stubVerifyDuplicateBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.PREVIOUSLY_SCANNED_BARCODE}")]` }],
      headers: {
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: {
          code: 'DUPLICATE',
          userMessage:
            'Someone scanned this barcode at 9:11 am on 8 December 2021 at HMP Altcourse. It may be an illegal copy.',
          scannedDate: '2021-12-08T09:11:23Z',
          scannedLocation: 'ACI',
          createdBy: 'Aardvark Lawyers',
          recipientName: 'Joe Spice',
          recipientPrisonNumber: 'A1234BC',
        },
      },
    },
  })

const stubVerifyRandomCheckBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.BARCODE_SELECTED_FOR_RANDOM_CHECK}")]` }],
      headers: {
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: {
          code: 'RANDOM_CHECK',
          userMessage: 'For additional security this barcode has been selected for a random check',
          createdBy: 'Aardvark Lawyers',
        },
      },
    },
  })

const stubVerifyExpiredBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.EXPIRED_BARCODE}")]` }],
      headers: {
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: {
          code: 'EXPIRED',
          userMessage: 'This barcode was created 42 days ago, on 8 December 2021',
          barcodeExpiryDays: 28,
          createdDate: '2021-12-08T09:11:23Z',
          createdBy: 'Aardvark Lawyers',
        },
      },
    },
  })

const stubVerifyNotFoundBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.UNRECOGNISED_BARCODE}")]` }],
      headers: {
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubMoreChecksRequestedForBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/event/more-checks-requested',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode =~ /\\d{12}/)]` }],
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubCreateBarcode = (prisonerName?: string): SuperAgentRequest => {
  const bodyMatcher = prisonerName
    ? `$[?(@.prisonerName == '${prisonerName}' && @.prisonId =~ /.+/i && @.contactId =~ /.+/i)]`
    : '$[?(@.prisonerName =~ /.+/i && @.prisonId =~ /.+/i && @.contactId =~ /.+/i)]'
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode',
      bodyPatterns: [{ matchesJsonPath: bodyMatcher }],
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { barcode: '123456789012' },
    },
  })
}

const stubCreateBarcodeFailure = (prisonerName?: string): SuperAgentRequest => {
  const bodyMatcher = prisonerName
    ? `$[?(@.prisonerName == '${prisonerName}' && @.prisonId =~ /.+/i && @.contactId =~ /.+/i)]`
    : '$[?(@.prisonerName =~ /.+/i && @.prisonId =~ /.+/i && @.contactId =~ /.+/i)]'
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode',
      bodyPatterns: [{ matchesJsonPath: bodyMatcher }],
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
        'x-slm-client-ip': { matches: '.+' },
      },
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })
}

export default {
  stubVerifyValidBarcode,
  stubVerifyDuplicateBarcode,
  stubVerifyRandomCheckBarcode,
  stubVerifyExpiredBarcode,
  stubVerifyNotFoundBarcode,
  stubMoreChecksRequestedForBarcode,
  stubCreateBarcode,
  stubCreateBarcodeFailure,
}
