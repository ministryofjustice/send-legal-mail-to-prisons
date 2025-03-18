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
  is: jest.fn(),
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
  sendStatus: jest.fn(),
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
      res.render.mockReset()
      res.redirect.mockReset()
      res.cookie.mockReset()
      req.originalUrl = ''
      req.body = {}
      req.cookies = {}
      req.is.mockReset()
    })

    it('should redirect to the last page and not set any cookies if no cookie preference submitted on the request', async () => {
      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response,
      )

      expect(res.redirect).toHaveBeenCalledWith('/lastPage')
      expect(res.cookie).not.toHaveBeenCalled()
    })

    it('should redirect to the cookies policy page if we came from there', async () => {
      req.originalUrl = '/cookies-policy'

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response,
      )

      expect(res.redirect).toHaveBeenCalledWith('/cookies-policy')
      expect(res.cookie).not.toHaveBeenCalled()
    })

    it('should set a cookie with cookie preference and redirect given request submitted as a browser full page request/response (non ajax)', async () => {
      req.body = { cookies: 'accept' }
      res.cookie.mockReturnValue(res)
      req.is.mockReturnValue(false)

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response,
      )

      expect(res.cookie).toHaveBeenCalledWith(
        'cookies_policy',
        'accept',
        expect.objectContaining({ sameSite: 'lax', secure: true, httpOnly: true }),
      )
      expect(req.is).toHaveBeenCalledWith('application/json')
      expect(res.redirect).toHaveBeenCalledWith('/lastPage?showCookieConfirmation=true')
    })

    it('should set cookie and render response containing a page partial given request submitted as an ajax request', async () => {
      req.body = { cookies: 'accept' }
      res.cookie.mockReturnValue(res)
      req.is.mockReturnValue(true)

      await cookiesPolicyController.submitCookiesPolicyPreferences(
        req as unknown as Request,
        res as unknown as Response,
      )

      expect(res.render).toHaveBeenCalledWith(
        'partials/cookies/cookie-preferences-set',
        {
          cookiesPolicy: { policy: 'accept' },
        },
        expect.any(Function),
      )
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.is).toHaveBeenCalledWith('application/json')
    })
  })

  describe('submitConfirmCookiesPolicy', () => {
    afterEach(() => {
      req.session.cookiesPolicy = {
        policy: undefined as string,
        showConfirmation: false,
        lastPage: '/lastPage',
      }
      req.is.mockReset()
      res.redirect.mockReset()
      res.sendStatus.mockReset()
    })

    it('should redirect given request submitted as a browser full page request/response (non ajax)', async () => {
      req.is.mockReturnValue(false)

      await cookiesPolicyController.submitConfirmCookiesPolicy(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/lastPage')
      expect(res.sendStatus).not.toHaveBeenCalled()
      expect(req.is).toHaveBeenCalledWith('application/json')
    })

    it('should set 200 status given request submitted as an ajax request', async () => {
      req.is.mockReturnValue(true)

      await cookiesPolicyController.submitConfirmCookiesPolicy(req as unknown as Request, res as unknown as Response)

      expect(res.sendStatus).toHaveBeenCalledWith(200)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.is).toHaveBeenCalledWith('application/json')
    })
  })
})
