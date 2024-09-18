import { createRedisClient, RedisClient } from '../redisClient'
import RedisStore from './RedisStore'

export default class TokenStore extends RedisStore {
  private readonly prefix = 'systemToken:'

  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    return this.setRedisAsync(`${this.prefix}${key}`, token, 'EX', durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getRedisAsync(`${this.prefix}${key}`)
  }
}
