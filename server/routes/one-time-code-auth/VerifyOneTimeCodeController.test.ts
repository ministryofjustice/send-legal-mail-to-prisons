import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError, JwtPayload, verify as verifyJwt } from 'jsonwebtoken'
import VerifyOneTimeCodeController from './VerifyOneTimeCodeController'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'

jest.mock('jsonwebtoken')

const req = {
  session: {
    barcodeUser: {
      token: undefined as string,
      tokenValid: false,
      email: undefined as string,
    },
    cookie: {
      expires: undefined as Date,
    },
    regenerate: jest.fn(),
  },
  flash: jest.fn(),
  body: {},
  ip: '127.0.0.1',
  sessionID: '12345678',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const next = jest.fn()

const oneTimeCodeService = {
  verifyOneTimeCode: jest.fn(),
}

describe('VerifyOneTimeCodeController', () => {
  const mockVerifyJwt = verifyJwt as jest.MockedFunction<typeof verifyJwt>

  const verifyOneTimeCodeController = new VerifyOneTimeCodeController(
    oneTimeCodeService as unknown as OneTimeCodeService
  )

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('verifyOneTimeCode', () => {
    it('should setup barcode user on session and redirect to find recipient', async () => {
      req.body = { code: 'ABCD' }
      const jwt = 'a-valid-jwt'
      oneTimeCodeService.verifyOneTimeCode.mockReturnValue(jwt)
      const jwtPayload: JwtPayload = {
        sub: 'someone@aardvark.cjsm.net',
        exp: 1646155014,
      }
      mockVerifyJwt.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, jwtPayload)
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
      expect(req.session.barcodeUser).toEqual({
        tokenValid: true,
        token: 'a-valid-jwt',
        email: 'someone@aardvark.cjsm.net',
      })
      expect(req.session.cookie.expires).toStrictEqual(new Date(2022, 2, 1, 17, 16, 54))
      expect(req.session.regenerate).toHaveBeenCalled()
    })

    it('should redirect to request code page given API returns a JWT that cannot be verified/decoded', async () => {
      req.body = { code: 'ABCD' }
      const jwt = 'a-valid-jwt'
      oneTimeCodeService.verifyOneTimeCode.mockReturnValue(jwt)
      mockVerifyJwt.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(new JsonWebTokenError('some-error'), undefined)
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#email', text: 'The code you used is no longer valid. Request a new one to sign in.' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/request-code')
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })

    it('should redirect to email sent page given no code submitted on request', async () => {
      req.body = {}

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#code', text: 'Enter the code from your email.' }])
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/email-sent')
      expect(oneTimeCodeService.verifyOneTimeCode).not.toHaveBeenCalled()
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })

    it('should redirect to email sent page given API returns error indicating it could not verify the code', async () => {
      req.body = { code: 'ABCD' }
      oneTimeCodeService.verifyOneTimeCode.mockRejectedValue({
        status: 401,
        data: { status: 401, errorCode: { code: 'OTC_NOT_FOUND', userMessage: 'Not found' } },
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#code', text: 'Enter the code we emailed you. This is 4 letters, like DNLC' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/email-sent')
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })

    it('should redirect to request code page given API returns error indicating there is no code to try for this session', async () => {
      req.body = { code: 'ABCD' }
      oneTimeCodeService.verifyOneTimeCode.mockRejectedValue({
        status: 401,
        data: { status: 401, errorCode: { code: 'OTC_SESSION_NOT_FOUND', userMessage: 'Session not found' } },
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/code-no-longer-valid')
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })

    it('should redirect to start again page given API returns error indicating too many incorrect codes', async () => {
      req.body = { code: 'ABCD' }
      oneTimeCodeService.verifyOneTimeCode.mockRejectedValue({
        status: 401,
        data: { status: 401, errorCode: { code: 'OTC_TOO_MANY_ATTEMPTS', userMessage: 'Too many attempts' } },
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/start-again')
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })

    it('should pass an unexpected error onto express', async () => {
      req.body = { code: 'ABCD' }
      oneTimeCodeService.verifyOneTimeCode.mockRejectedValue({
        status: 500,
        data: { status: 500, errorCode: { code: 'INTERNAL_ERROR', userMessage: 'Internal error' } },
      })

      await verifyOneTimeCodeController.verifyOneTimeCode(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction
      )

      expect(req.flash).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(req.session.barcodeUser).toEqual({ tokenValid: false, token: undefined })
    })
  })
})
