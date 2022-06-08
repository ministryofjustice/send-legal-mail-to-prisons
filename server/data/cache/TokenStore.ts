import RedisStore from './RedisStore'
import { createRedisClient, RedisClient } from './RedisClient'

const KEY_PREFIX = 'systemToken:'

export default class TokenStore extends RedisStore {
  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    return this.setEntry(`${KEY_PREFIX}${key}`, token, durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getEntry(`${KEY_PREFIX}${key}`)
  }
}
