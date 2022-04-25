// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import type { PrisonDto } from 'prisonRegisterApiClient'
import type { PrisonAddress } from 'prisonTypes'
import PrisonRegisterService from './PrisonRegisterService'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'

const prisonRegisterStore = {
  setActivePrisons: jest.fn(),
  getActivePrisons: jest.fn(),
}

const prisonDtosFromPrisonRegister: Array<PrisonDto> = [
  {
    prisonId: 'ALI',
    prisonName: 'Albany (HMP)',
    active: false,
    male: false,
    female: false,
    types: [],
    addresses: [],
  },
  {
    prisonId: 'AKI',
    prisonName: 'Acklington (HMP)',
    active: false,
    male: false,
    female: false,
    types: [],
    addresses: [],
  },
  {
    prisonId: 'KTI',
    prisonName: 'Kennet (HMP)',
    active: false,
    male: false,
    female: false,
    types: [],
    addresses: [],
  },
  {
    prisonId: 'ACI',
    prisonName: 'Altcourse (HMP)',
    active: true,
    male: true,
    female: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    addresses: [
      {
        id: 1,
        addressLine1: 'Brookfield Drive',
        addressLine2: 'Fazakerley',
        town: 'Liverpool',
        county: 'Lancashire',
        postcode: 'L9 7LH',
        country: 'England',
      },
    ],
  },
  {
    prisonId: 'ASI',
    prisonName: 'Ashfield (HMP)',
    active: true,
    male: true,
    female: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    addresses: [
      {
        id: 2,
        addressLine1: 'Shortwood Road',
        addressLine2: 'Pucklechurch',
        town: 'Bristol',
        county: 'Gloucestershire',
        postcode: 'BS16 9QJ',
        country: 'England',
      },
    ],
  },
]
const activePrisons: Array<PrisonAddress> = [
  {
    agencyCode: 'ACI',
    agyDescription: 'Altcourse (HMP)',
    premise: 'HMP Altcourse',
    street: 'Brookfield Drive',
    locality: 'Fazakerley, Liverpool',
    postalCode: 'L9 7LH',
  },
  {
    agencyCode: 'ASI',
    agyDescription: 'Ashfield (HMP)',
    premise: 'HMP Ashfield',
    street: 'Shortwood Road',
    locality: 'Pucklechurch, Bristol',
    postalCode: 'BS16 9QJ',
  },
]

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
      mockedPrisonRegisterApi.get('/prisons').reply(200, prisonDtosFromPrisonRegister)

      const expectedActivePrisons = [
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const returnedActivePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons)
    })

    it('should get all active prisons from the prison register given reading from redis throws an error', async () => {
      prisonRegisterStore.getActivePrisons.mockRejectedValue('some error reading from redis')
      mockedPrisonRegisterApi.get('/prisons').reply(200, prisonDtosFromPrisonRegister)

      const expectedActivePrisons = [
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const returnedActivePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons)
    })

    it('should get all active prisons from the prison register store given they are already in the redis store', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)

      const expectedActivePrisons = [
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const returnedActivePrisons = await prisonRegisterService.getActivePrisonsFromPrisonRegister()

      expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
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

  describe('getPrisonAddress', () => {
    it('should get prison address given prison exists', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)
      const prisonId = 'ASI'

      const expectedPrisonAddress: PrisonAddress = {
        agencyCode: 'ASI',
        agyDescription: 'Ashfield (HMP)',
        premise: 'HMP Ashfield',
        street: 'Shortwood Road',
        locality: 'Pucklechurch, Bristol',
        postalCode: 'BS16 9QJ',
      }

      const prisonAddress: PrisonAddress = await prisonRegisterService.getPrisonAddress(prisonId)

      expect(prisonAddress).toStrictEqual(expectedPrisonAddress)
    })

    it('should not get prison address given prison does not exist', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)
      const prisonId = 'XYZ'

      try {
        await prisonRegisterService.getPrisonAddress(prisonId)
      } catch (error) {
        expect(error).toStrictEqual(new Error('PrisonAddress for prison XYZ not found'))
      }
    })
  })

  describe('getPrisonNameOrId', () => {
    it('should get prison name given valid prison ID', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)

      const prisonName = await prisonRegisterService.getPrisonNameOrId('ASI')

      expect(prisonName).toBe('HMP Ashfield')
    })

    it('should return prison ID given invalid prison id', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)

      const prisonName = await prisonRegisterService.getPrisonNameOrId('XYZ')

      expect(prisonName).toBe('XYZ')
    })
  })
})
