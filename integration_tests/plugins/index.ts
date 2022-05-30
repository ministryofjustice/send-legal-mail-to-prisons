import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import prisonRegister from '../mockApis/prisonRegister'
import zendesk from '../mockApis/zendesk'
import state from '../support/state'
import oneTimeCode from '../mockApis/sendLegalMail/oneTimeCode'
import link from '../mockApis/sendLegalMail/link'
import barcode from '../mockApis/sendLegalMail/barcode'
import contact from '../mockApis/sendLegalMail/contact'
import cjsm from '../mockApis/sendLegalMail/cjsm'
import supportedPrisons from '../mockApis/sendLegalMail/supportedPrisons'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: () => auth.stubSignIn([]),
    stubSignInWithRole_SLM_SCAN_BARCODE: () => auth.stubSignIn(['ROLE_SLM_SCAN_BARCODE']),
    stubSignInWithRole_SLM_ADMIN: () => auth.stubSignIn(['ROLE_SLM_ADMIN']),

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,
    stubAuthToken: auth.stubToken,

    stubTokenVerificationPing: tokenVerification.stubPing,

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

    stubCreateZendeskTicket: zendesk.stubCreateZendeskTicket,
    stubCreateZendeskTicketFailure: zendesk.stubCreateZendeskTicketFailure,

    setSmokeTestBarcode: state.setSmokeTestBarcode,
    getSmokeTestBarcode: state.getSmokeTestBarcode,
  })
}
