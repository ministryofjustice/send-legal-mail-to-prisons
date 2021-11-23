import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

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

const stubVerifyLink = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        token:
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      },
    },
  })

const stubVerifyLinkInvalidSignatureFailure = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/send-legal-mail/link/verify',
      bodyPatterns: [{ matchesJsonPath: '$[?(@.secret =~ /.*/i)]' }],
    },
    response: {
      status: 200,
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

export default {
  stubRequestLink,
  stubRequestLinkFailure,
  stubVerifyLink,
  stubVerifyLinkNotFoundFailure,
  stubVerifyLinkInvalidSignatureFailure,
}
