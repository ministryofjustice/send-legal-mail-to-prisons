import { Request, Response } from 'express'
import CookiesPolicyController from './CookiesPolicyController'

const req = {
  session: {
    cookiesPolicy: {
      policy: undefined as string,
      showConfirmation: false,
      lastPage: '/lastPage',
    },
  },
  body: {},
  cookies: {},
  query: {},
  originalUrl: '',
}
const res = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
  render: jest.fn(),
  redirect: jest.fn(),
  locals: {
    url: undefined as string,
    externalUser: true,
  },
}

const next = jest.fn()

describe('CookiesPolicyController', () => {
  let cookiesPolicyController: CookiesPolicyController

  beforeEach(() => {
    cookiesPolicyController = new CookiesPolicyController()
  })

  describe('initialiseCookieSessions', () => {
    afterEach(() => {
      req.session.cookiesPolicy = {
        policy: undefined as string,
        showConfirmation: false,
        lastPage: '/lastPage',
      }
      req.body = {}
      req.cookies = {}
      req.query = {}
      req.originalUrl = ''
      res.locals = {
        url: undefined as string,
        externalUser: true,
      }
      res.render.mockReset()
      res.redirect.mockReset()
    })

    it('should save the cookie policy from a cookie', async () => {
      req.cookies = {
        cookies_policy: 'some-policy',
      }

      await cookiesPolicyController.initialiseCookieSession(req as unknown as Request, res as unknown as Response, next)

      expect(req.session.cookiesPolicy.policy).toEqual('some-policy')
      expect(next).toHaveBeenCalled()
    })

    it('should save last page', async () => {
      req.cookies = {
        cookies_policy: 'some-policy',
      }
      req.originalUrl = '/original-url'

      await cookiesPolicyController.initialiseCookieSession(req as unknown as Request, res as unknown as Response, next)

      expect(req.session.cookiesPolicy.lastPage).toEqual('/original-url')
      expect(next).toHaveBeenCalled()
    })

    it('should remove query parameter if saving last page', async () => {
      req.cookies = {
        cookies_policy: 'some-policy',
      }
      req.originalUrl = '/original-url?showCookieConfirmation=true'

      await cookiesPolicyController.initialiseCookieSession(req as unknown as Request, res as unknown as Response, next)

      expect(req.session.cookiesPolicy.lastPage).toEqual('/original-url')
      expect(res.locals.url).toEqual('/original-url?showCookieConfirmation=true')
      expect(next).toHaveBeenCalled()
    })

    it('should NOT save last page on the cookies policy page', async () => {
      req.cookies = {
        cookies_policy: 'some-policy',
      }
      req.originalUrl = '/cookies-policy'

      await cookiesPolicyController.initialiseCookieSession(req as unknown as Request, res as unknown as Response, next)

      expect(req.session.cookiesPolicy.lastPage).toEqual('/lastPage')
      expect(next).toHaveBeenCalled()
    })

    it('should set n/a policy for internal users', async () => {
      res.locals.externalUser = false

      await cookiesPolicyController.initialiseCookieSession(req as unknown as Request, res as unknown as Response, next)

      expect(req.session.cookiesPolicy.policy).toEqual('n/a')
      expect(req.session.cookiesPolicy.showConfirmation).toBeFalsy()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('submitCookiesPolicyPreferences', () => {
    afterEach(() => {
      res.redirect.mockReset()
      res.cookie.mockReset()
      req.originalUrl = ''
      req.body = {}
      req.cookies = {}
    })

    it('should redirect to the last page', async () => {
      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/lastPage')
    })

    it('should redirect to the cookies policy page if we came from there', async () => {
      req.originalUrl = '/cookies-policy'

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/cookies-policy')
    })

    it('should set a cookie with cookie preference', async () => {
      req.body = { cookies: 'accept' }
      res.cookie.mockReturnValue(res)

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.cookie).toHaveBeenCalledWith('cookies_policy', 'accept', expect.anything())
    })

    it('should set cookie confirmation parameter on redirect url', async () => {
      req.body = { cookies: 'accept' }
      res.cookie.mockReturnValue(res)

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/lastPage?showCookieConfirmation=true')
    })

    it('should reject any google analytics cookies', async () => {
      req.body = { cookies: 'reject' }
      req.cookies = { cookies_policy: 'reject', _ga: 'some ga stuff' }
      res.cookie.mockReturnValue(res)

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.clearCookie).not.toHaveBeenCalledWith('reject')
      expect(res.clearCookie).toHaveBeenCalledWith('_ga')
    })
  })
})
