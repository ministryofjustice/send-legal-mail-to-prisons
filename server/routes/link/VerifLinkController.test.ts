import { Request, Response } from 'express'
import { JsonWebTokenError, verify } from 'jsonwebtoken'
import VerifyLinkController from './VerifyLinkController'
import MagicLinkService from '../../services/link/MagicLinkService'

jest.mock('jsonwebtoken')

const req = {
  session: {
    validSlmToken: false,
    slmToken: undefined as string,
    barcodeUserEmail: undefined as string,
    barcodeUserOrganisation: undefined as string,
    cookie: {
      expires: undefined as Date,
    },
    regenerate: jest.fn(),
  },
  flash: jest.fn(),
  body: {},
  query: { secret: undefined as string },
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}
const magicLinkService = {
  verifyLink: jest.fn(),
}

describe('VerifyLinkController', () => {
  let verifyLinkController: VerifyLinkController
  let mockVerify: jest.MockedFunction<typeof verify>

  beforeEach(() => {
    verifyLinkController = new VerifyLinkController(magicLinkService as unknown as MagicLinkService)
    mockVerify = verify as jest.MockedFunction<typeof verify>
  })

  afterEach(() => {
    req.session.validSlmToken = false
    req.session.slmToken = undefined as string
    req.session.barcodeUserEmail = undefined as string
    req.session.barcodeUserOrganisation = undefined as string
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

    it('should show error on email if the magic link service fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockRejectedValue('some-error')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([expect.objectContaining({ href: '#email' })])
      )
    })

    it('should redirect if the magic link service fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockRejectedValue('some-error')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('request-link')
    })

    it('should show error on email if token verification fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(new JsonWebTokenError('some-error'), undefined)
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([expect.objectContaining({ href: '#email' })])
      )
    })

    it('should redirect if token verification fails', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(new JsonWebTokenError('some-error'), undefined)
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/link/request-link')
    })
  })

  describe('verifyLink - happy path', () => {
    it('should call the magic link service', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(magicLinkService.verifyLink).toHaveBeenCalledWith('some-secret')
    })

    it('should set the token on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.slmToken).toStrictEqual('some-token')
    })

    it('should verify the token on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, {})
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.validSlmToken).toStrictEqual(true)
    })

    it('should set token details on the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, { sub: 'some-email', organisation: 'some-org' })
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.barcodeUserEmail).toStrictEqual('some-email')
      expect(req.session.barcodeUserOrganisation).toStrictEqual('some-org')
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

    it('should regenerate the session', async () => {
      req.query.secret = 'some-secret'
      magicLinkService.verifyLink.mockResolvedValue('some-token')
      mockVerify.mockImplementation((token, key, opts, verifyCallback) => {
        verifyCallback(undefined, {})
      })

      await verifyLinkController.verifyLink(req as unknown as Request, res as unknown as Response)

      expect(req.session.regenerate).toHaveBeenCalled()
    })
  })
})
