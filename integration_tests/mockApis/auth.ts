import jwt from 'jsonwebtoken'
import { Response } from 'superagent'

import { stubFor, getRequests } from './wiremock'
import tokenVerification from './tokenVerification'

const createToken = (authorities: string[]) => {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getRequests().then(data => {
    const { requests } = data.body
    const stateParam = requests[0].request.queryParams.state
    const stateValue = stateParam ? stateParam.values[0] : requests[1].request.queryParams.state.values[0]
    return `/sign-in/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><head><title>SignIn page</title></head><body><h1>Sign in</h1><span class="govuk-visually-hidden" id="pageId" data-qa="sign-in"></span></body></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><head><title>SignIn page</title></head><body><h1>Sign in</h1><span class="govuk-visually-hidden" id="pageId" data-qa="sign-in"></span></body></html>',
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>Your account details</h1><span class="govuk-visually-hidden" id="pageId" data-qa="account-details"></span></body></html>',
    },
  })

const token = (authorities: string[]) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(authorities),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const stubUser = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        activeCaseLoadId: 'MDI',
        authSource: 'nomis',
        staffId: 231232,
        userId: 231232,
        username: 'USER1',
        active: true,
        name: 'john smith',
        uuid: '5105a589-75b3-4ca0-9433-b96228c1c8f3',
      },
    },
  })

const stubUserRoles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me/roles',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ roleId: 'SOME_USER_ROLE' }],
    },
  })

export default {
  getSignInUrl,
  stubPing: (): Promise<[Response, Response]> => Promise.all([ping(), tokenVerification.stubPing()]),
  stubSignIn: (authorities: string[]): Promise<[Response, Response, Response, Response, Response, Response]> =>
    Promise.all([
      favicon(),
      redirect(),
      signOut(),
      manageDetails(),
      token(authorities),
      tokenVerification.stubVerifyToken(),
    ]),
  stubUser: (): Promise<[Response, Response]> => Promise.all([stubUser(), stubUserRoles()]),
  stubToken: (): Promise<Response> => token([]),
}
