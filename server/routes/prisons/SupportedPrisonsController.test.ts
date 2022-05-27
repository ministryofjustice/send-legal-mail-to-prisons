import { Request, Response } from 'express'
import SupportedPrisonsController from './SupportedPrisonsController'
import validatePrisonId from '../barcode/validators/prisonIdValidator'
import PrisonService from '../../services/prison/PrisonService'

jest.mock('../barcode/validators/prisonIdValidator')

const req = {
  flash: jest.fn(),
  user: { token: 'some-token' },
  body: {},
  params: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}
const prisonService = {
  getPrisonsBySupported: jest.fn(),
  addSupportedPrison: jest.fn(),
  removeSupportedPrison: jest.fn(),
}

describe('SupportedPrisonsController', () => {
  let mockValidatePrisonId: jest.MockedFunction<typeof validatePrisonId>

  const supportedPrisonsController = new SupportedPrisonsController(prisonService as unknown as PrisonService)

  beforeEach(() => {
    mockValidatePrisonId = validatePrisonId as jest.MockedFunction<typeof validatePrisonId>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSupportedPrisonsView', () => {
    it('should render page', async () => {
      prisonService.getPrisonsBySupported.mockResolvedValue({
        supportedPrisons: [{ id: 'ABC', name: 'Prison ABC' }],
        unsupportedPrisons: [{ id: 'CDE', name: 'Prison CDE' }],
      })

      await supportedPrisonsController.getSupportedPrisonsView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/prisons/supported-prisons', {
        supportedPrisons: [{ id: 'ABC', name: 'Prison ABC' }],
        unsupportedPrisons: [
          { value: '', text: '' },
          { value: 'CDE', text: 'Prison CDE', selected: false },
        ],
        errors: [],
      })
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should display errors', async () => {
      prisonService.getPrisonsBySupported.mockRejectedValue('some-error')

      await supportedPrisonsController.getSupportedPrisonsView(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      expect(res.redirect).toHaveBeenCalledWith('/supported-prisons')
    })
  })

  describe('addSupportedPrison', () => {
    it('should add a prison', async () => {
      req.body = { prisonId: 'ABC' }
      mockValidatePrisonId.mockReturnValue([])
      prisonService.addSupportedPrison.mockResolvedValue({})

      await supportedPrisonsController.addSupportedPrison(req as unknown as Request, res as unknown as Response)

      expect(prisonService.addSupportedPrison).toHaveBeenCalledWith('some-token', 'ABC')
      expect(res.redirect).toHaveBeenCalledWith('/supported-prisons')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('should show errors if validation fails', async () => {
      req.body = { prisonId: 'ABC' }
      mockValidatePrisonId.mockReturnValue(['some-error'])

      await supportedPrisonsController.addSupportedPrison(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'some-error' }])
    })

    it('should show errors if add prison fails', async () => {
      req.body = { prisonId: 'ABC' }
      mockValidatePrisonId.mockReturnValue([])
      prisonService.addSupportedPrison.mockRejectedValue({
        status: 404,
        data: { errorCode: { code: 'NOT_FOUND', userMessage: 'Not Found' } },
      })

      await supportedPrisonsController.addSupportedPrison(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Not Found' }])
    })
  })

  describe('removeSupportedPrison', () => {
    it('should remove a prison', async () => {
      req.params = { prisonId: 'ABC' }
      prisonService.removeSupportedPrison.mockResolvedValue({})

      await supportedPrisonsController.removeSupportedPrison(req as unknown as Request, res as unknown as Response)

      expect(prisonService.removeSupportedPrison).toHaveBeenCalledWith('some-token', 'ABC')
      expect(res.redirect).toHaveBeenCalledWith('/supported-prisons')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('should show errors if remove prison fails', async () => {
      req.params = { prisonId: 'ABC' }
      prisonService.removeSupportedPrison.mockRejectedValue({
        status: 404,
        data: { errorCode: { code: 'NOT_FOUND', userMessage: 'Not Found' } },
      })

      await supportedPrisonsController.removeSupportedPrison(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'Not Found' }])
    })
  })
})
