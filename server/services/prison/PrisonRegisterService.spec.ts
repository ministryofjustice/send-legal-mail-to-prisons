// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import PrisonRegisterService from './PrisonRegisterService'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import { Prison, PrisonAddress } from '../../@types/prisonTypes'

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

  describe('getActivePrisons', () => {
    it('should make the request to the prison register without an authorization header', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      nock(config.apis.prisonRegister.url, {
        badheaders: ['authorization'],
      })
        .get('/prisons')
        .reply(200, [])

      await prisonRegisterService.getActivePrisons()
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

      const activePrisons = await prisonRegisterService.getActivePrisons()

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

      const activePrisons = await prisonRegisterService.getActivePrisons()

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

      const activePrisons = await prisonRegisterService.getActivePrisons()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
    })

    it('should fail to get active prisons given nothing in redis store and calling prison register API fails', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      mockedPrisonRegisterApi.get('/prisons').reply(404, 'Error calling the Prison Register API')

      try {
        await prisonRegisterService.getActivePrisons()
      } catch (error) {
        expect(error).toBe('Error calling the Prison Register API')
        expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
      }
    })
  })

  describe('getPrisonAddress', () => {
    mockPrisonAddressData()

    it('should get prison address given prison exists', async () => {
      const prison = { id: 'ASI' } as Prison

      const expectedPrisonAddress: PrisonAddress = {
        flat: null,
        premise: 'HMP & YOI ASHFIELD',
        street: 'Shortwood Road',
        locality: 'Pucklechurch',
        countyCode: null,
        area: 'Pucklechurch Bristol',
        postalCode: 'BS16 9QJ',
      }

      const prisonAddress: PrisonAddress = await prisonRegisterService.getPrisonAddress(prison)

      expect(prisonAddress).toStrictEqual(expectedPrisonAddress)
    })

    it('should not get prison address given prison does not exist', async () => {
      const prison = { id: 'XYZ' } as Prison

      try {
        await prisonRegisterService.getPrisonAddress(prison)
      } catch (error) {
        expect(error).toStrictEqual(new Error('PrisonAddress for prison XYZ not found'))
      }
    })
  })

  function mockPrisonAddressData() {
    jest.mock('./prisonAddressData.json', () => [
      {
        agencyCode: 'ACI',
        agyDescription: 'ALTCOURSE (HMP)',
        agyLocType: 'Prison',
        flat: null,
        premise: 'HMP ALTCOURSE',
        street: 'Higher Lane',
        locality: 'Fazakerley',
        countyCode: null,
        area: 'Fazakerley Liverpool',
        postalCode: 'L9 7LH',
      },
      {
        agencyCode: 'ASI',
        agyDescription: 'ASHFIELD (HMP)',
        agyLocType: 'Prison',
        flat: null,
        premise: 'HMP & YOI ASHFIELD',
        street: 'Shortwood Road',
        locality: 'Pucklechurch',
        countyCode: null,
        area: 'Pucklechurch Bristol',
        postalCode: 'BS16 9QJ',
      },
    ])
  }
})
