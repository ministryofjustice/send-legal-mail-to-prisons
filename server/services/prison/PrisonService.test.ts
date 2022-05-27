import PrisonRegisterService from './PrisonRegisterService'
import SupportedPrisonsService from './SupportedPrisonsService'
import PrisonService from './PrisonService'

const supportedPrisonsService = {
  getSupportedPrisons: jest.fn(),
  addSupportedPrison: jest.fn(),
  removeSupportedPrison: jest.fn(),
}
const prisonRegisterService = {
  getActivePrisonsFromPrisonRegister: jest.fn(),
}

describe('PrisonService', () => {
  const prisonService = new PrisonService(
    prisonRegisterService as unknown as PrisonRegisterService,
    supportedPrisonsService as unknown as SupportedPrisonsService
  )

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrisons', () => {
    it('should return prisons', async () => {
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([
        { id: 'ABC', name: 'Prison ABC' },
        { id: 'CDE', name: 'Prison CDE' },
      ])

      const prisons = await prisonService.getPrisons()

      expect(prisons).toEqual([
        { id: 'ABC', name: 'Prison ABC' },
        { id: 'CDE', name: 'Prison CDE' },
      ])
      expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
    })

    it('should pass on errors from the prison register service', async () => {
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockRejectedValue('some-error')

      await prisonService.getSupportedPrisons().catch(error => {
        expect(error).toEqual('some-error')
        expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
      })
    })
  })

  describe('getSupportedPrisons', () => {
    it('should return supported prisons', async () => {
      supportedPrisonsService.getSupportedPrisons.mockResolvedValue({ supportedPrisons: ['ABC'] })
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([
        { id: 'ABC', name: 'Prison ABC' },
        { id: 'CDE', name: 'Prison CDE' },
      ])

      const supportedPrisons = await prisonService.getSupportedPrisons()

      expect(supportedPrisons).toEqual([{ id: 'ABC', name: 'Prison ABC' }])
      expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
      expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
    })

    it('should pass on errors from the supported prison service', async () => {
      supportedPrisonsService.getSupportedPrisons.mockRejectedValue('some-error')
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([])

      await prisonService.getSupportedPrisons().catch(error => {
        expect(error).toEqual('some-error')
        expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
        expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
      })
    })

    it('should pass on errors from the prison register service', async () => {
      supportedPrisonsService.getSupportedPrisons.mockResolvedValue([])
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockRejectedValue('some-error')

      await prisonService.getSupportedPrisons().catch(error => {
        expect(error).toEqual('some-error')
        expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
        expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
      })
    })
  })

  describe('getPrisonsBySupported', () => {
    it('should return supported and unsupported prisons', async () => {
      supportedPrisonsService.getSupportedPrisons.mockResolvedValue({ supportedPrisons: ['ABC'] })
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([
        { id: 'ABC', name: 'Prison ABC' },
        { id: 'CDE', name: 'Prison CDE' },
      ])

      const prisonsBySupported = await prisonService.getPrisonsBySupported()

      expect(prisonsBySupported.supportedPrisons).toEqual([{ id: 'ABC', name: 'Prison ABC' }])
      expect(prisonsBySupported.unsupportedPrisons).toEqual([{ id: 'CDE', name: 'Prison CDE' }])
      expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
      expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
    })

    it('should pass on errors from the supported prison service', async () => {
      supportedPrisonsService.getSupportedPrisons.mockRejectedValue('some-error')
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([])

      await prisonService.getPrisonsBySupported().catch(error => {
        expect(error).toEqual('some-error')
        expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
        expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
      })
    })

    it('should pass on errors from the prison register service', async () => {
      supportedPrisonsService.getSupportedPrisons.mockResolvedValue([])
      prisonRegisterService.getActivePrisonsFromPrisonRegister.mockRejectedValue('some-error')

      await prisonService.getPrisonsBySupported().catch(error => {
        expect(error).toEqual('some-error')
        expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
        expect(supportedPrisonsService.getSupportedPrisons).toHaveBeenCalled()
      })
    })
  })
})
