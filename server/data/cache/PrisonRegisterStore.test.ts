import type { Prison } from 'prisonTypes'
import type { RedisClient } from '../redisClient'
import PrisonRegisterStore from './PrisonRegisterStore'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  del: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

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
      'prisonRegister:activePrisons',
      JSON.stringify(activePrisons),
      { EX: 172800 } // 2 days in seconds
    )
  })

  it('Can get active prisons given promise resolves', async () => {
    const serializedActivePrisons = JSON.stringify(activePrisons)
    redisClient.get.mockReturnValue(Promise.resolve(serializedActivePrisons))

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(activePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
  })

  it('Returns a resolved promise of null given there are no active prisons in redis', async () => {
    const serializedActivePrisons: string = null
    redisClient.get.mockReturnValue(Promise.resolve(serializedActivePrisons))

    const expectedActivePrisons: Array<Prison> = null

    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
  })

  it('Fails to get active prisons given promise rejects', async () => {
    redisClient.get.mockReturnValue(Promise.resolve(''))

    try {
      await prisonRegisterStore.getActivePrisons()
    } catch (error) {
      expect(error).toStrictEqual(new SyntaxError('Unexpected end of JSON input'))
      expect(redisClient.get).toHaveBeenCalledWith('prisonRegister:activePrisons')
    }
  })
})
