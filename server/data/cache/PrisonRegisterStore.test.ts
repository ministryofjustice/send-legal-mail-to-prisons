import { RedisClient } from 'redis'
import type { PrisonDto } from 'prisonRegisterApiClient'
import PrisonRegisterStore from './PrisonRegisterStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
}

const activePrisons: Array<PrisonDto> = [
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

describe('PrisonRegisterStore', () => {
  let prisonRegisterStore: PrisonRegisterStore

  beforeEach(() => {
    prisonRegisterStore = new PrisonRegisterStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can set active prisons', () => {
    redisClient.set.mockImplementation((key, value, mode, durationSeconds, callback) => callback())
    const durationDays = 2

    prisonRegisterStore.setActivePrisons(activePrisons, durationDays)

    expect(redisClient.set).toHaveBeenCalledWith(
      'activePrisons',
      JSON.stringify(activePrisons),
      'EX',
      172800, // 2 days in seconds
      expect.any(Function)
    )
  })

  it('Can get active prisons given promise resolves', async () => {
    const serializedActivePrisons = JSON.stringify(activePrisons)
    redisClient.get.mockImplementation((key, callback) => callback(null, serializedActivePrisons))

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(activePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('activePrisons', expect.any(Function))
  })

  it('Returns a resolved promise of null given there are no active prisons in redis', async () => {
    const serializedActivePrisons: string = null
    redisClient.get.mockImplementation((key, callback) => callback(null, serializedActivePrisons))

    const expectedActivePrisons: Array<PrisonDto> = null

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('activePrisons', expect.any(Function))
  })

  it('Fails to get active prisons given promise rejects', async () => {
    redisClient.get.mockImplementation((key, callback) => callback('some error', null))

    try {
      await prisonRegisterStore.getActivePrisons()
    } catch (error) {
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('activePrisons', expect.any(Function))
    }
  })
})
