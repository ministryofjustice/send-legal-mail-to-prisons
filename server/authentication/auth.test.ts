import { SessionData } from 'express-session'
import { NextFunction, Request, Response } from 'express'
import config from '../config'
import auth from './auth'
import tokenVerifier from '../data/tokenVerification'
import type SmokeTestStore from '../data/cache/SmokeTestStore'

const req = {
  session: {} as SessionData,
  isAuthenticated: jest.fn(),
  query: {} as Record<string, unknown>,
  originalUrl: 'some-original-url',
  user: { authSource: 'some-authsource' },
}
const res = {
  redirect: jest.fn(),
  locals: {},
}
const next = jest.fn()
const smokeTestStore = {
  getSmokeTestSecret: jest.fn(),
}
jest.mock('../data/tokenVerification')
const verifyToken = tokenVerifier as jest.Mock

describe('authenticationMiddleware', () => {
  const authenticationMiddleware = auth.authenticationMiddleware(
    tokenVerifier,
    smokeTestStore as undefined as SmokeTestStore,
  )

  beforeEach(() => {
    config.featureFlags.lsjOneTimeCodeAuthEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
    req.session = {} as SessionData
    res.locals = {}
    req.user = { authSource: 'some-authsource' }
  })

  describe('authentication', () => {
    beforeEach(() => {
      config.smoketest.msjSecret = undefined
    })

    it('should continue for authenticated user', async () => {
      req.isAuthenticated.mockReturnValue(true)
      verifyToken.mockResolvedValue(true)

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(req.isAuthenticated).toHaveBeenCalled()
      expect(verifyToken).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('should redirect if not authenticated', async () => {
      req.isAuthenticated.mockReturnValue(false)

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
      expect(req.session.returnTo).toEqual('some-original-url')
    })

    it('should redirect if token invalid', async () => {
      req.isAuthenticated.mockReturnValue(true)
      verifyToken.mockResolvedValue(false)

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should redirect to oneTimeCode request page for external users', async () => {
      req.isAuthenticated.mockReturnValue(false)
      res.locals = { externalUser: true }

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/request-code')
    })
  })

  describe('smoke test', () => {
    beforeEach(() => {
      config.smoketest.msjSecret = 'some-msj-secret'
      smokeTestStore.getSmokeTestSecret.mockResolvedValue('some-msj-secret')
    })

    afterEach(() => {
      req.session = {} as SessionData
    })

    it('should continue for smoke test request', async () => {
      req.query['smoke-test'] = 'some-msj-secret'

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.user.authSource).toEqual('smoketest')
    })

    it('should continue for smoke test session', async () => {
      req.session = { msjSmokeTestUser: true } as undefined as SessionData

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.user.authSource).toEqual('smoketest')
    })

    it('should redirect for incorrect smoke test secret', async () => {
      req.query['smoke-test'] = 'not-the-msj-secret'

      await authenticationMiddleware(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
      expect(req.user.authSource).toEqual('some-authsource')
    })
  })
})
