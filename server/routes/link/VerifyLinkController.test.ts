import { Request, Response } from 'express'
import { JsonWebTokenError, verify } from 'jsonwebtoken'
import type { CjsmUserDetails } from 'sendLegalMailApiClient'
import VerifyLinkController from './VerifyLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'
import AppInsightsService from '../../services/AppInsightsService'

jest.mock('jsonwebtoken')

const req = {
  session: {
    barcodeUser: {
      token: undefined as string,
      tokenValid: false,
      email: undefined as string,
      cjsmDetails: undefined as CjsmUserDetails,
    },
    // barcodeUserOrganisation: undefined as string,
    cookie: {
      expires: undefined as Date,
    },
    regenerate: jest.fn(),
  },
  flash: jest.fn(),
  body: {},
  query: { secret: undefined as string },
  ip: '127.0.0.1',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}
const magicLinkService = {
  verifyLink: jest.fn(),
}
const appInsightsClient = {
  trackEvent: jest.fn(),
}

describe('VerifyLinkController', () => {
  let verifyLinkController: VerifyLinkController
  let mockVerify: jest.MockedFunction<typeof verify>

  beforeEach(() => {
    verifyLinkController = new VerifyLinkController(
      magicLinkService as unknown as MagicLinkService,
      appInsightsClient as unknown as AppInsightsService,
    )
    mockVerify = verify as jest.MockedFunction<typeof verify>
  })

  afterEach(() => {
    req.session.barcodeUser = { token: undefined, tokenValid: false, email: undefined, cjsmDetails: undefined }
    req.session.cookie = {
      expires: undefined as Date,
    }
    req.query.secret = undefined as string
    jest.resetAllMocks()
  })

  describe('verifyLink - sad path', () => {
    it('should redirect if no secret passed', async () => {
      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('request-link')
    })

    it('should show error and redirect if the magic link service fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockRejectedValue('some-error')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([expect.objectContaining({ href: '#email' })]),
      )
      expect(res.redirect).toHaveBeenCalledWith('request-link')
    })

    it('should show error and redirect if token verification fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(new JsonWebTokenError('some-error'), undefined)
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([expect.objectContaining({ href: '#email' })]),
      )
      expect(res.redirect).toHaveBeenCalledWith('/link/request-link')
    })
  })

  describe('verifyLink - happy path', () => {
    it('should set the token on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(magicLinkService.verifyLink).toHaveBeenCalledWith('some-secret', '127.0.0.1')
      expect(req.session.barcodeUser.token).toStrictEqual('some-token')
    })

    it('should verify the token on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, {})
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.barcodeUser.tokenValid).toStrictEqual(true)
    })

    it('should set token details on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, { sub: 'some-email', organisation: 'some-org' })
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.barcodeUser?.email).toStrictEqual('some-email')
    })

    it('should set cookie expiry from the token', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, { exp: 1646155014 })
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.cookie.expires).toStrictEqual(new Date(2022, 2, 1, 17, 16, 54))
    })

    it('should regenerate the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, {})
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.regenerate).toHaveBeenCalled()
    })

    it('should redirect to find recipient if the user is already logged in', async () => {
      req.session.barcodeUser = {
        token: 'a-valid-token',
        tokenValid: true,
        email: 'some.user@some.solicitors.cjsm.net',
        cjsmDetails: {
          userId: 'some.user@some.solicitors.cjsm.net',
          organisation: 'Some Solicitors Ltd',
          organisationType: 'Barristers',
          townOrCity: 'London',
        },
      }
      req.query.secret = 'some-secret'

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
      expect(magicLinkService.verifyLink).not.toHaveBeenCalled()
      expect(appInsightsClient.trackEvent).toHaveBeenCalledWith('duplicateMagicLinkClick', {
        username: 'some.user@some.solicitors.cjsm.net',
      })
    })
  })
})
