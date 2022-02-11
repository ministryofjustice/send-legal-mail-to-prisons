// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import type { PrisonAddress } from 'prisonTypes'
import PrisonRegisterService from './PrisonRegisterService'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'

const prisonRegisterStore = {
  setActivePrisons: jest.fn(),
  getActivePrisons: jest.fn(),
}

describe('Prison Register Service', () => {
  let prisonRegisterService: PrisonRegisterService
  let mockedPrisonRegisterApi: nock.Scope

  beforeEach(() => {
    mockedPrisonRegisterApi = nock(config.apis.prisonRegister.url)
    prisonRegisterService = new PrisonRegisterService(prisonRegisterStore as unknown as PrisonRegisterStore)
  })

  afterEach(() => {
    nock.cleanAll()
    prisonRegisterStore.getActivePrisons.mockReset()
    prisonRegisterStore.setActivePrisons.mockReset()
  })

  describe('getActivePrisonsFromPrisonRegister', () => {
    it('should make the request to the prison register without an authorization header', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      nock(config.apis.prisonRegister.url, {
        badheaders: ['authorization'],
      })
        .get('/prisons')
        .reply(200, [])

      await prisonRegisterService.getActivePrisonsFromPrisonRegister()
    })

    it('should get all active prisons from the prison register given they are not in the redis store', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      mockedPrisonRegisterApi.get('/prisons').reply(200, [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ])

      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const activePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(expectedActivePrisons)
    })

    it('should get all active prisons from the prison register given reading from redis throws an error', async () => {
      prisonRegisterStore.getActivePrisons.mockRejectedValue('some error reading from redis')
      mockedPrisonRegisterApi.get('/prisons').reply(200, [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ])

      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const activePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(expectedActivePrisons)
    })

    it('should get all active prisons from the prison register store given they are already in the redis store', async () => {
      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ]
      prisonRegisterStore.getActivePrisons.mockResolvedValue(expectedActivePrisons)

      const activePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
    })

    it('should fail to get active prisons given nothing in redis store and calling prison register API fails', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      mockedPrisonRegisterApi.get('/prisons').reply(404, 'Error calling the Prison Register API')

      try {
        await prisonRegisterService.getActivePrisonsFromPrisonRegister()
      } catch (error) {
        expect(error).toBe('Error calling the Prison Register API')
        expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
      }
    })
  })

  describe('getActivePrisons', () => {
    it('should get all active prisons from the prison register given they are not in the redis store', async () => {
      const activePrisons = prisonRegisterService.getActivePrisons()

      const firstPrison = activePrisons.find(prison => prison.id === 'ACI')
      const somePrison = activePrisons.find(prison => prison.id === 'HDI')
      const lastPrison = activePrisons.find(prison => prison.id === 'WMI')

      expect(firstPrison.name).toStrictEqual('Altcourse (HMP)')
      expect(somePrison.name).toStrictEqual('Hatfield (HMP/YOI)')
      expect(lastPrison.name).toStrictEqual('Wymott (HMP)')
    })
  })

  describe('getPrisonAddress', () => {
    it('should get prison address given prison exists', async () => {
      const prisonId = 'ASI'

      const expectedPrisonAddress: PrisonAddress = {
        agencyCode: 'ASI',
        flat: '',
        premise: 'HMP Ashfield',
        street: 'Shortwood Road',
        locality: 'Pucklechurch',
        countyCode: '',
        area: 'Bristol',
        postalCode: 'BS16 9QJ',
      }

      const prisonAddress: PrisonAddress = await prisonRegisterService.getPrisonAddress(prisonId)

      expect(prisonAddress).toStrictEqual(expectedPrisonAddress)
    })

    it('should not get prison address given prison does not exist', async () => {
      const prisonId = 'XYZ'

      try {
        await prisonRegisterService.getPrisonAddress(prisonId)
      } catch (error) {
        expect(error).toStrictEqual(new Error('PrisonAddress for prison XYZ not found'))
      }
    })
  })

  describe('getPrisonNameOrId', () => {
    it('should get prison name given valid prison ID', () => {
      const prisonName = prisonRegisterService.getPrisonNameOrId('ASI')

      expect(prisonName).toBe('HMP Ashfield')
    })

    it('should return prison ID given invalid prison id', () => {
      const prisonName = prisonRegisterService.getPrisonNameOrId('XYZ')

      expect(prisonName).toBe('XYZ')
    })
  })
})
