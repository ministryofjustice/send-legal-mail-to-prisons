import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'

import auth from './integration_tests/mockApis/auth'
import prisonRegister from './integration_tests/mockApis/prisonRegister'
import state from './integration_tests/support/state'
import oneTimeCode from './integration_tests/mockApis/sendLegalMail/oneTimeCode'
import link from './integration_tests/mockApis/sendLegalMail/link'
import barcode from './integration_tests/mockApis/sendLegalMail/barcode'
import contact from './integration_tests/mockApis/sendLegalMail/contact'
import cjsm from './integration_tests/mockApis/sendLegalMail/cjsm'
import supportedPrisons from './integration_tests/mockApis/sendLegalMail/supportedPrisons'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  downloadsFolder: 'integration_tests/downloads',
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,

        stubAuthPing: auth.stubPing,
        stubAuthToken: auth.stubToken,

        stubRequestLink: link.stubRequestLink,
        stubRequestLinkFailure: link.stubRequestLinkFailure,
        stubRequestLinkNonCjsmEmailFailure: link.stubRequestLinkNonCjsmEmailFailure,
        stubRequestLinkEmailTooLong: link.stubRequestLinkEmailTooLong,
        stubVerifyLink: link.stubVerifyLink,
        stubVerifyLinkThatWillExpireIn1SecondFromNow: link.stubVerifyLinkThatWillExpireIn1SecondFromNow,
        stubVerifyLinkNotFoundFailure: link.stubVerifyLinkNotFoundFailure,
        stubVerifyLinkInvalidSignatureFailure: link.stubVerifyLinkInvalidSignatureFailure,

        stubVerifyValidBarcode: barcode.stubVerifyValidBarcode,
        stubVerifyDuplicateBarcode: barcode.stubVerifyDuplicateBarcode,
        stubVerifyRandomCheckBarcode: barcode.stubVerifyRandomCheckBarcode,
        stubVerifyExpiredBarcode: barcode.stubVerifyExpiredBarcode,
        stubVerifyNotFoundBarcode: barcode.stubVerifyNotFoundBarcode,
        stubMoreChecksRequestedForBarcode: barcode.stubMoreChecksRequestedForBarcode,
        stubCreateBarcode: barcode.stubCreateBarcode,
        stubCreateBarcodeFailure: barcode.stubCreateBarcodeFailure,

        stubCreateContact: contact.stubCreateContact,
        stubSearchContactsNone: contact.stubSearchContactsNone,
        stubSearchContactsOne: contact.stubSearchContactsOne,
        stubGetContactNone: contact.stubGetContactNone,
        stubGetContactOne: contact.stubGetContactOne,
        stubGetContact: contact.stubGetContact,
        stubUpdateContact: contact.stubUpdateContact,

        stubGetCjsmUserDetails: cjsm.stubGetCjsmUserDetails,

        stubRequestOneTimeCode: oneTimeCode.stubRequestOneTimeCode,
        stubRequestOneTimeCodeFailure: oneTimeCode.stubRequestOneTimeCodeFailure,
        stubRequestOneTimeCodeNonCjsmEmailFailure: oneTimeCode.stubRequestOneTimeCodeNonCjsmEmailFailure,
        stubRequestOneTimeCodeEmailTooLong: oneTimeCode.stubRequestOneTimeCodeEmailTooLong,
        stubVerifyOneTimeCode: oneTimeCode.stubVerifyOneTimeCode,
        stubVerifyOneTimeCodeThatWillExpireIn1SecondFromNow:
          oneTimeCode.stubVerifyOneTimeCodeThatWillExpireIn1SecondFromNow,
        stubVerifyOneTimeCodeNotFoundFailure: oneTimeCode.stubVerifyOneTimeCodeNotFoundFailure,
        stubVerifyOneTimeCodeInvalidSignatureFailure: oneTimeCode.stubVerifyOneTimeCodeInvalidSignatureFailure,

        stubGetPrisonRegister: prisonRegister.stubGetPrisonRegister,
        stubGetSupportedPrisons: supportedPrisons.stubGetSupportedPrisons,

        setSmokeTestBarcode: state.setSmokeTestBarcode,
        getSmokeTestBarcode: state.getSmokeTestBarcode,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    experimentalRunAllSpecs: true,
  },
})
