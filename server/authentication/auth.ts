import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import type { RequestHandler } from 'express'

import config from '../config'
import generateOauthClientToken from './clientCredentials'
import type { TokenVerifier } from '../data/tokenVerification'
import SmokeTestStore from '../data/cache/SmokeTestStore'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

export type AuthenticationMiddleware = (tokenVerifier: TokenVerifier, smokeTestStore: SmokeTestStore) => RequestHandler

const authenticationMiddleware: AuthenticationMiddleware = (verifyToken, smokeTestStore) => {
  return async (req, res, next) => {
    const { msjSecret } = config.smoketest

    function configureMsjSmoketestUser() {
      req.user = { username: msjSecret, token: msjSecret, authSource: 'smoketest' }
      res.locals.user = {
        username: msjSecret,
        name: 'Smoke Test MSJ',
        displayName: 'Smoke Test MSJ',
        activeCaseLoadId: 'SKI',
      }
      res.locals.user.roles = ['ROLE_SLM_SCAN_BARCODE', 'ROLE_SLM_SECURITY_ANALYST']
    }

    async function checkForSmokeTestRequest() {
      if (req.query['smoke-test']) {
        const smokeTestSecret = await smokeTestStore.getSmokeTestSecret()
        if (req.query['smoke-test'] === smokeTestSecret) {
          req.session.msjSmokeTestUser = true
        }
      }
    }

    if (msjSecret && req.query['smoke-test']) {
      await checkForSmokeTestRequest()
      if (req.session.msjSmokeTestUser) {
        configureMsjSmoketestUser()
        return next()
      }
    }

    if (req.isAuthenticated() && (await verifyToken(req))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    if (res.locals.externalUser) {
      return res.redirect('/link/request-link')
    }
    return res.redirect('/sign-in')
  }
}

function init(): void {
  const strategy = new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.apiClientId,
      clientSecret: config.apis.hmppsAuth.apiClientSecret,
      callbackURL: `${config.domain}/sign-in/callback`,
      state: true,
      customHeaders: { Authorization: generateOauthClientToken() },
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    }
  )

  passport.use(strategy)
}

export default {
  authenticationMiddleware,
  init,
}
