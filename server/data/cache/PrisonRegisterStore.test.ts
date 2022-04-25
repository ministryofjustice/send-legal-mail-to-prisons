import { RedisClient } from 'redis'
import type { Prison } from 'prisonTypes'
import PrisonRegisterStore from './PrisonRegisterStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
}

const activePrisons: Array<Prison> = [
  {
    id: 'ACI',
    name: 'Altcourse (HMP)',
    addressName: 'HMP Altcourse',
    street: 'Brookfield Drive',
    locality: 'Fazakerley, Liverpool',
    postalCode: 'L9 7LH',
  },
  {
    id: 'ASI',
    name: 'Ashfield (HMP)',
    addressName: 'HMP Ashfield',
    street: 'Shortwood Road',
    locality: 'Pucklechurch, Bristol',
    postalCode: 'BS16 9QJ',
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

    const expectedActivePrisons: Array<Prison> = null

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
