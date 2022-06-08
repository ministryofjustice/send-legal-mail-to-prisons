import { RedisClient } from './RedisClient'
import TokenStore from './TokenStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
  isOpen: jest.fn(),
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
    redisClient.get.mockResolvedValue('token-1')

    const token = await tokenStore.getToken('user-1')

    expect(token).toBe('token-1')
    expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
  })

  it('Will reopen connection if down', async () => {
    ;(redisClient as unknown as Record<string, boolean>).isOpen = false
    redisClient.get.mockResolvedValue('token-1')

    await tokenStore.getToken('user-1')

    expect(redisClient.connect).toHaveBeenCalledWith()
    expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
  })

  it('Fails to retrieve token given promise rejects', async () => {
    redisClient.get.mockRejectedValue('some error')

    try {
      await tokenStore.getToken('user-1')
    } catch (error) {
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
    }
  })

  it('Can set token', async () => {
    await tokenStore.setToken('user-1', 'token-1', 10)

    expect(redisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
  })
})
