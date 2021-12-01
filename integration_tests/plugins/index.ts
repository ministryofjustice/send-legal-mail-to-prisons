import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import sendLegalMail from '../mockApis/sendLegalMail'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: () => auth.stubSignIn([]),
    stubSignInWithRole_SLM_SCAN_BARCODE: () => auth.stubSignIn(['SLM_SCAN_BARCODE']),
    stubSignInWithRole_SLM_SECURITY_ANALYST: () => auth.stubSignIn(['SLM_SECURITY_ANALYST']),

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
  })
}
