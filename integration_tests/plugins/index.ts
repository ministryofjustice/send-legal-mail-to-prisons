import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import sendLegalMail from '../mockApis/sendLegalMail'
import prisonRegister from '../mockApis/prisonRegister'
import zendesk from '../mockApis/zendesk'
import state from '../support/state'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: () => auth.stubSignIn([]),
    stubSignInWithRole_SLM_SCAN_BARCODE: () => auth.stubSignIn(['ROLE_SLM_SCAN_BARCODE']),
    stubSignInWithRole_SLM_SECURITY_ANALYST: () => auth.stubSignIn(['ROLE_SLM_SECURITY_ANALYST']),

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,
    stubAuthToken: auth.stubToken,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubRequestLink: sendLegalMail.stubRequestLink,
    stubRequestLinkFailure: sendLegalMail.stubRequestLinkFailure,
    stubRequestLinkNonCjsmEmailFailure: sendLegalMail.stubRequestLinkNonCjsmEmailFailure,
    stubRequestLinkEmailTooLong: sendLegalMail.stubRequestLinkEmailTooLong,
    stubVerifyLink: sendLegalMail.stubVerifyLink,
    stubVerifyLinkThatWillExpireIn1SecondFromNow: sendLegalMail.stubVerifyLinkThatWillExpireIn1SecondFromNow,
    stubVerifyLinkNotFoundFailure: sendLegalMail.stubVerifyLinkNotFoundFailure,
    stubVerifyLinkInvalidSignatureFailure: sendLegalMail.stubVerifyLinkInvalidSignatureFailure,

    stubVerifyValidBarcode: sendLegalMail.stubVerifyValidBarcode,
    stubVerifyDuplicateBarcode: sendLegalMail.stubVerifyDuplicateBarcode,
    stubVerifyRandomCheckBarcode: sendLegalMail.stubVerifyRandomCheckBarcode,
    stubVerifyExpiredBarcode: sendLegalMail.stubVerifyExpiredBarcode,
    stubVerifyNotFoundBarcode: sendLegalMail.stubVerifyNotFoundBarcode,
    stubMoreChecksRequestedForBarcode: sendLegalMail.stubMoreChecksRequestedForBarcode,
    stubCreateContact: sendLegalMail.stubCreateContact,
    stubSearchContactsNone: sendLegalMail.stubSearchContactsNone,
    stubSearchContactsOne: sendLegalMail.stubSearchContactsOne,
    stubGetContactNone: sendLegalMail.stubGetContactNone,
    stubGetContactOne: sendLegalMail.stubGetContactOne,
    stubGetContact: sendLegalMail.stubGetContact,
    stubUpdateContact: sendLegalMail.stubUpdateContact,

    stubCreateBarcode: sendLegalMail.stubCreateBarcode,
    stubCreateBarcodeFailure: sendLegalMail.stubCreateBarcodeFailure,

    stubGetPrisonRegister: prisonRegister.stubGetPrisonRegister,

    stubCreateZendeskTicket: zendesk.stubCreateZendeskTicket,
    stubCreateZendeskTicketFailure: zendesk.stubCreateZendeskTicketFailure,

    setSmokeTestBarcode: state.setSmokeTestBarcode,
    getSmokeTestBarcode: state.getSmokeTestBarcode,
  })
}
