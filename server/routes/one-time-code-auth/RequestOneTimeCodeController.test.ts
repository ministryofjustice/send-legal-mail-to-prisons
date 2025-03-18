import { NextFunction, Request, Response } from 'express'
import type { SessionData } from 'express-session'
import RequestOneTimeCodeController from './RequestOneTimeCodeController'
import VerifyOneTimeCodeController from './VerifyOneTimeCodeController'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'
import validate from './RequestOneTimeCodeValidator'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
  ip: '127.0.0.1',
  sessionID: '12345678',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const oneTimeCodeService = {
  requestOneTimeCode: jest.fn(),
}
const verifyOneTimeCodeController = {
  verifyOneTimeCode: jest.fn(),
}

const next = jest.fn()

jest.mock('./RequestOneTimeCodeValidator')

describe('RequestOneTimeCodeController', () => {
  const requestOneTimeCodeController = new RequestOneTimeCodeController(
    oneTimeCodeService as unknown as OneTimeCodeService,
    verifyOneTimeCodeController as unknown as VerifyOneTimeCodeController,
  )

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getRequestOneTimeCodeView', () => {
    it('should render view given no requestOneTimeCodeForm on the session', async () => {
      req.session.requestOneTimeCodeForm = undefined

      await requestOneTimeCodeController.getRequestOneTimeCodeView(
        req as undefined as Request,
        res as undefined as Response,
      )

      expect(res.render).toHaveBeenCalledWith('pages/one-time-code-auth/requestOneTimeCode', {
        errors: [],
        form: {},
      })
      expect(req.session.requestOneTimeCodeForm).toBeUndefined()
    })

    it('should render view given requestOneTimeCodeForm on the session and errors', async () => {
      req.session.requestOneTimeCodeForm = { email: 'someone@aarvark.com' }
      req.flash.mockReturnValue([{ href: '#email', text: 'Enter a valid email' }])

      await requestOneTimeCodeController.getRequestOneTimeCodeView(
        req as undefined as Request,
        res as undefined as Response,
      )

      expect(res.render).toHaveBeenCalledWith('pages/one-time-code-auth/requestOneTimeCode', {
        errors: [{ href: '#email', text: 'Enter a valid email' }],
        form: { email: 'someone@aarvark.com' },
      })
      expect(req.session.requestOneTimeCodeForm).toBeUndefined()
    })
  })

  describe('submitOneTimeCodeRequest', () => {
    const mockRequestOneTimeCodeValidator = validate as jest.MockedFunction<typeof validate>

    it('should redirect to email sent page given valid requestOneTimeCodeForm', async () => {
      req.body = { email: 'someone@aarvark.com.cjsm.net' }
      mockRequestOneTimeCodeValidator.mockReturnValue(true)
      oneTimeCodeService.requestOneTimeCode.mockResolvedValue(undefined)

      await requestOneTimeCodeController.submitOneTimeCodeRequest(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(oneTimeCodeService.requestOneTimeCode).toHaveBeenCalledWith(
        'someone@aarvark.com.cjsm.net',
        '12345678',
        '127.0.0.1',
      )
      expect(res.redirect).toHaveBeenCalledWith('email-sent')
      expect(req.session.lsjSmokeTestUser).toBeFalsy()
    })

    it('should redirect to request code page given invalid requestOneTimeCodeForm', async () => {
      req.body = { email: 'someone@aarvark.com' }
      mockRequestOneTimeCodeValidator.mockReturnValue(false)

      await requestOneTimeCodeController.submitOneTimeCodeRequest(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(oneTimeCodeService.requestOneTimeCode).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('request-code')
      expect(req.session.lsjSmokeTestUser).toBeFalsy()
    })

    it('should redirect to request code page with errors given service fails', async () => {
      req.body = { email: 'someone@aarvark.com.cjsm.net' }
      mockRequestOneTimeCodeValidator.mockReturnValue(true)
      oneTimeCodeService.requestOneTimeCode.mockRejectedValue({ status: 503 })

      await requestOneTimeCodeController.submitOneTimeCodeRequest(
        req as undefined as Request,
        res as undefined as Response,
        next as undefined as NextFunction,
      )

      expect(oneTimeCodeService.requestOneTimeCode).toHaveBeenCalledWith(
        'someone@aarvark.com.cjsm.net',
        '12345678',
        '127.0.0.1',
      )
      expect(res.redirect).toHaveBeenCalledWith('request-code')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          href: '#email',
          text: 'There was an error generating your sign in code. Try again to request a new one to sign in.',
        },
      ])
      expect(req.session.lsjSmokeTestUser).toBeFalsy()
    })
  })
})
