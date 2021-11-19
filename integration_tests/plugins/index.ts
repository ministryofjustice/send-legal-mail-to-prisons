import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import sendLegalMail from '../mockApis/sendLegalMail'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,
    stubAuthToken: auth.stubToken,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubRequestLink: sendLegalMail.stubRequestLink,
    stubRequestLinkFailure: sendLegalMail.stubRequestLinkFailure,
  })
}
