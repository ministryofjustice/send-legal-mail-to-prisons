import { RedisClient } from '../redisClient'
import TokenStore from './TokenStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
}

describe('TokenStore', () => {
  let tokenStore: TokenStore

  beforeEach(() => {
    tokenStore = new TokenStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Can retrieve token given promise resolves', async () => {
    redisClient.get.mockImplementation((key, callback) => callback(null, 'token-1'))

    const token = await tokenStore.getToken('user-1')
    expect(token).toBe('token-1')
    expect(redisClient.get).toHaveBeenCalledWith('user-1', expect.any(Function))
  })

  it('Fails to retrieve token given promise rejects', async () => {
    redisClient.get.mockImplementation((key, callback) => callback('some error', null))

    try {
      await tokenStore.getToken('user-1')
    } catch (error) {
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('user-1', expect.any(Function))
    }
  })

  it('Can set token', async () => {
    redisClient.set.mockImplementation((key, value, mode, durationSeconds, callback) => callback())

    await tokenStore.setToken('user-1', 'token-1', 10)

    expect(redisClient.set).toHaveBeenCalledWith('user-1', 'token-1', 'EX', 10, expect.any(Function))
  })
})
