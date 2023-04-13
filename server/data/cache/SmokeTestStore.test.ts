import { Request } from 'express'
import type { RedisClient } from '../redisClient'
import SmokeTestStore from './SmokeTestStore'
import config from '../../config'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

const req = {
  body: {},
}

describe('SmokeTestStore', () => {
  let smokeTestStore: SmokeTestStore

  beforeEach(() => {
    smokeTestStore = new SmokeTestStore(redisClient as unknown as RedisClient)
    req.body = {}
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set the smoke test secret', async () => {
    redisClient.set.mockImplementation((key, value, { EX: durationSeconds }) => undefined)

    await smokeTestStore.setSmokeTestSecret('some-secret')

    expect(redisClient.set).toHaveBeenCalledWith(
      'smokeTest',
      'some-secret',
      'EX',
      expect.any(Number),
      expect.any(Function)
    )
  })

  it('should get and delete the smoke test secret', async () => {
    redisClient.get.mockImplementation((key, callback) => callback(null, 'some-secret'))

    const secret = await smokeTestStore.getSmokeTestSecret()

    expect(redisClient.get).toHaveBeenCalledWith('smokeTest', expect.any(Function))
    expect(redisClient.del).toHaveBeenCalledWith('smokeTest')
    expect(secret).toBe('some-secret')
  })

  it('should start a smoke test', async () => {
    config.smoketest.msjSecret = 'some-secret'
    req.body = { msjSecret: 'some-secret' }
    redisClient.set.mockImplementation((key, value, mode, durationSeconds, callback) => callback())

    const secret = await smokeTestStore.startSmokeTest(req as unknown as Request)

    expect(secret).toHaveLength(40)
    expect(redisClient.set).toHaveBeenCalledWith('smokeTest', secret, 'EX', expect.any(Number), expect.any(Function))
  })

  it('should not start a smoke test if the secret is incorrect', async () => {
    config.smoketest.msjSecret = 'some-secret'
    req.body = { msjSecret: 'incorrect-secret' }

    const secret = await smokeTestStore.startSmokeTest(req as unknown as Request)

    expect(secret).toBeFalsy()
    expect(redisClient.set).not.toHaveBeenCalled()
  })
})
