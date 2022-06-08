import type { Prison } from 'prisonTypes'
import type { RedisClient } from './RedisClient'
import PrisonRegisterStore from './PrisonRegisterStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
  isOpen: jest.fn(),
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
    redisClient.connect.mockResolvedValue('')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can set active prisons', async () => {
    const durationDays = 2

    await prisonRegisterStore.setActivePrisons(activePrisons, durationDays)

    expect(redisClient.set).toHaveBeenCalledWith(
      'prisonRegister:activePrisons',
      JSON.stringify(activePrisons),
      { EX: 172800 } // 2 days in seconds
    )
  })

  it('Can get active prisons given promise resolves', async () => {
    const serializedActivePrisons = JSON.stringify(activePrisons)
    redisClient.get.mockResolvedValue(serializedActivePrisons)

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(activePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
  })

  it('Will reopen connection if down', async () => {
    ;(redisClient as unknown as Record<string, boolean>).isOpen = false
    const serializedActivePrisons = JSON.stringify(activePrisons)
    redisClient.get.mockResolvedValue(serializedActivePrisons)

    await prisonRegisterStore.getActivePrisons()

    expect(redisClient.connect).toHaveBeenCalledWith()
    expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
  })

  it('Returns a resolved promise of null given there are no active prisons in redis', async () => {
    const serializedActivePrisons: string = null
    redisClient.get.mockResolvedValue(serializedActivePrisons)

    const expectedActivePrisons: Array<Prison> = null

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
  })

  it('Fails to get active prisons given promise rejects', async () => {
    redisClient.get.mockRejectedValue('some error')

    try {
      await prisonRegisterStore.getActivePrisons()
    } catch (error) {
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
    }
  })
})
