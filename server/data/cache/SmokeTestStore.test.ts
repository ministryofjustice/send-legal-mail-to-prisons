import { Request } from 'express'
import type { RedisClient } from '../redisClient'
import SmokeTestStore from './SmokeTestStore'
import config from '../../config'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  del: jest.fn(),
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
    await smokeTestStore.setSmokeTestSecret('some-secret')

    expect(redisClient.set).toHaveBeenCalledWith('smokeTest:smokeTest', 'some-secret', {
      EX: expect.any(Number),
    })
  })

  it('should get and delete the smoke test secret', async () => {
    redisClient.get.mockReturnValue(Promise.resolve('some-secret'))

    const secret = await smokeTestStore.getSmokeTestSecret()

    expect(redisClient.get).toHaveBeenCalledWith('smokeTest:smokeTest')
    expect(redisClient.del).toHaveBeenCalledWith('smokeTest:smokeTest')
    expect(secret).toBe('some-secret')
  })

  it('should start a smoke test', async () => {
    config.smoketest.msjSecret = 'some-secret'
    req.body = { msjSecret: 'some-secret' }

    const secret = await smokeTestStore.startSmokeTest(req as unknown as Request)

    expect(secret).toHaveLength(40)
    expect(redisClient.set).toHaveBeenCalledWith('smokeTest:smokeTest', secret, {
      EX: expect.any(Number),
    })
  })

  it('should not start a smoke test if the secret is incorrect', async () => {
    config.smoketest.msjSecret = 'some-secret'
    req.body = { msjSecret: 'incorrect-secret' }

    const secret = await smokeTestStore.startSmokeTest(req as unknown as Request)

    expect(secret).toBeFalsy()
    expect(redisClient.set).not.toHaveBeenCalled()
  })
})
