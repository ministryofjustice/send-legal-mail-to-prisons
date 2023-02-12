import type { Prison } from 'prisonTypes'
import type { RedisClient } from './redisClient'
import PrisonRegisterStore from './PrisonRegisterStore'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

const prefix = 'prisonRegister:'

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

  it('Can set active prisons', async () => {
    const durationDays = 2
    await prisonRegisterStore.setActivePrisons(activePrisons, durationDays)

    expect(redisClient.set).toHaveBeenCalledWith(
      `${prefix}activePrisons`,
      JSON.stringify(activePrisons),
      { EX: 172800 } // 2 days in seconds
    )
  })

  it('Can get active prisons given promise resolves', async () => {
    redisClient.get.mockResolvedValue(JSON.stringify(activePrisons))
    await expect(prisonRegisterStore.getActivePrisons()).resolves.toStrictEqual(activePrisons)
    expect(redisClient.get).toHaveBeenCalledWith(`${prefix}activePrisons`)
  })

  it('Returns a resolved promise of null given there are no active prisons in redis', async () => {
    const expectedActivePrisons: Array<Prison> = null

    redisClient.get.mockResolvedValue(JSON.stringify(expectedActivePrisons))
    const result = await prisonRegisterStore.getActivePrisons()
    expect(result).toEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith(`${prefix}activePrisons`)
  })

  it('Fails to get active prisons given promise rejects', async () => {
    try {
      redisClient.get.mockImplementation(() => {
        throw new Error('some error')
      })
      await prisonRegisterStore.getActivePrisons()
    } catch (error) {
      expect(error.toString()).toBe('Error: some error')
      expect(redisClient.get).toHaveBeenCalledWith(`${prefix}activePrisons`)
    }
  })
})
