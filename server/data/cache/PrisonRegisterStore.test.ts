import { RedisClient } from 'redis'
import PrisonRegisterStore from './PrisonRegisterStore'
import { Prison } from '../../@types/prisonTypes'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
}

describe('PrisonRegisterStore', () => {
  let prisonRegisterStore: PrisonRegisterStore

  beforeEach(() => {
    prisonRegisterStore = new PrisonRegisterStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can set active prisons', async () => {
    redisClient.set.mockImplementation((key, value, mode, durationSeconds, callback) => callback())
    const activePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]
    const durationDays = 2

    await prisonRegisterStore.setActivePrisons(activePrisons, durationDays)

    expect(redisClient.set).toHaveBeenCalledWith(
      'activePrisons',
      JSON.stringify(activePrisons),
      'EX',
      172800, // 2 days in seconds
      expect.any(Function)
    )
  })

  it('Can get active prisons given promise resolves', async () => {
    const serializedActivePrisons =
      '[{"id":"KTI","name":"Kennet (HMP)"},{"id":"ASI","name":"Ashfield (HMP)"},{"id":"ACI","name":"Altcourse (HMP)"}]'
    redisClient.get.mockImplementation((key, callback) => callback(null, serializedActivePrisons))

    const expectedActivePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]

    const activePrisons = await prisonRegisterStore.getActivePrisons()

    expect(activePrisons).toStrictEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('activePrisons', expect.any(Function))
  })

  it('Returns a resolved promise of null given there are no ective prisons in redis', async () => {
    const serializedActivePrisons: string = null
    redisClient.get.mockImplementation((key, callback) => callback(null, serializedActivePrisons))

    const expectedActivePrisons: Array<Prison> = null

    const activePrisons = await prisonRegisterStore.getActivePrisons()

    expect(activePrisons).toStrictEqual(expectedActivePrisons)
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
