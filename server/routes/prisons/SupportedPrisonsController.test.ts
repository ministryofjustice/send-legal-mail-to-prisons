import { Request, Response } from 'express'
import SupportedPrisonsController from './SupportedPrisonsController'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'

const req = {
  flash: jest.fn(),
  user: { token: 'some-token' },
} as unknown as Request
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
} as unknown as Response
const supportedPrisonsService = {
  getSupportedPrisons: jest.fn(),
  addSupportedPrison: jest.fn(),
  removeSupportedPrison: jest.fn(),
}

describe('SupportedPrisonsController', () => {
  const supportedPrisonsController = new SupportedPrisonsController(
    supportedPrisonsService as unknown as SupportedPrisonsService
  )

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSupportedPrisonsView', () => {
    it('should render page', async () => {
      supportedPrisonsService.getSupportedPrisons.mockResolvedValue({ supportedPrisons: ['ABC', 'CDE'] })

      await supportedPrisonsController.getSupportedPrisonsView(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/prisons/supported-prisons', {
        prisons: ['ABC', 'CDE'],
        errors: [],
      })
      expect(req.flash).toHaveBeenCalledWith('errors')
    })
  })

  describe('addSupportedPrison', () => {
    it('should add a prison', async () => {
      req.body = { addPrison: 'ABC' }
      supportedPrisonsService.addSupportedPrison.mockResolvedValue({})

      await supportedPrisonsController.addSupportedPrison(req, res)

      expect(supportedPrisonsService.addSupportedPrison).toHaveBeenCalledWith('some-token', 'ABC')
      expect(res.redirect).toHaveBeenCalledWith('/supported-prisons')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('should show errors if add prison fails', async () => {
      req.body = { addPrison: 'ABC' }
      supportedPrisonsService.addSupportedPrison.mockRejectedValue({
        status: 404,
        data: { errorCode: { code: 'NOT_FOUND', userMessage: 'Not Found' } },
      })

      await supportedPrisonsController.addSupportedPrison(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#addPrison', text: 'Not Found' }])
    })
  })

  describe('removeSupportedPrison', () => {
    it('should remove a prison', async () => {
      req.params = { prisonId: 'ABC' }
      supportedPrisonsService.removeSupportedPrison.mockResolvedValue({})

      await supportedPrisonsController.removeSupportedPrison(req, res)

      expect(supportedPrisonsService.removeSupportedPrison).toHaveBeenCalledWith('some-token', 'ABC')
      expect(res.redirect).toHaveBeenCalledWith('/supported-prisons')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('should show errors if remove prison fails', async () => {
      req.params = { prisonId: 'ABC' }
      supportedPrisonsService.removeSupportedPrison.mockRejectedValue({
        status: 404,
        data: { errorCode: { code: 'NOT_FOUND', userMessage: 'Not Found' } },
      })

      await supportedPrisonsController.removeSupportedPrison(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'Not Found' }])
    })
  })
})
