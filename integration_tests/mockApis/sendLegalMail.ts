import { SuperAgentRequest } from 'superagent'
import jwt from 'jsonwebtoken'
import { stubFor } from './wiremock'
import barcodes from './barcodes'

const privateKey = `-----BEGIN PRIVATE KEY-----
  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
  -----END PRIVATE KEY-----`.replace(/^\s+/gm, '')

const stubRequestLink = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i)]' }],
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubRequestLinkFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i)]' }],
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubRequestLinkNonCjsmEmailFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i)]' }],
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: {
          code: 'INVALID_CJSM_EMAIL',
          userMessage: `Enter an email address which ends with 'cjsm.net'`,
        },
      },
    },
  })

const stubRequestLinkEmailTooLong = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/email',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.email =~ /.*/i)]' }],
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: {
          code: 'EMAIL_TOO_LONG',
          userMessage: `The email address can have a maximum length of 254`,
        },
      },
    },
  })

const stubVerifyLink = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        token:
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      },
    },
  })

const stubVerifyLinkThatWillExpireIn1SecondFromNow = (): SuperAgentRequest => {
  const tokenThatWillExpireIn1Second = jwt.sign({}, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1s',
    subject: 'valid@email.address.cjsm.net',
    jwtid: 'de174c4b-1cc6-41af-a73b-5e16bb9c15eb',
    noTimestamp: true,
  })
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { token: tokenThatWillExpireIn1Second },
    },
  })
}

const stubVerifyLinkInvalidSignatureFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        token:
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJhLm4ub3RoZXIudXNlckBkaWdpdGFsLmp1c3RpY2UuZ292LnVrIiwiZXhwIjo0Nzg3NTY5NzIxfQ==.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      },
    },
  })

const stubVerifyLinkNotFoundFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubVerifyValidBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode/check',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.barcode == "${barcodes.VALID_BARCODE}")]` }],
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
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubCreateBarcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode',
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
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

const stubCreateBarcodeFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/barcode',
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
      },
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubCreateContact = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/contact',
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
      },
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        id: 1,
        prisonerName: `{{jsonPath request.body '$.prisonerName'}}`,
        prisonId: `{{jsonPath request.body '$.prisonId'}}`,
        prisonNumber: `{{jsonPath request.body '$.prisonNumber'}}`,
        prisonerDob: `{{jsonPath request.body '$.prisonerDob'}}`,
      },
    },
  })

const stubSearchContactsNone = (name = 'John Smith'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/send-legal-mail/contacts',
      queryParameters: {
        name: {
          equalTo: name,
        },
      },
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [],
    },
  })

const stubSearchContactsOneDob = (name = 'John Doe'): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/send-legal-mail/contacts',
      queryParameters: {
        name: {
          equalTo: name,
        },
      },
      headers: {
        'Create-Barcode-Token': {
          equalTo:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          id: 1,
          prisonerName: name,
          prisonId: `ACI`,
          prisonerDob: `1990-01-01`,
        },
      ],
    },
  })

export default {
  stubRequestLink,
  stubRequestLinkFailure,
  stubRequestLinkNonCjsmEmailFailure,
  stubRequestLinkEmailTooLong,
  stubVerifyLink,
  stubVerifyLinkThatWillExpireIn1SecondFromNow,
  stubVerifyLinkNotFoundFailure,
  stubVerifyLinkInvalidSignatureFailure,
  stubVerifyValidBarcode,
  stubVerifyDuplicateBarcode,
  stubVerifyRandomCheckBarcode,
  stubVerifyExpiredBarcode,
  stubVerifyNotFoundBarcode,
  stubCreateBarcode,
  stubCreateBarcodeFailure,
  stubCreateContact,
  stubSearchContactsNone,
  stubSearchContactsOneDob,
}
