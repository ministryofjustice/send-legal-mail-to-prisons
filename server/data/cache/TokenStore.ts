import redis from 'redis'
import createRedisClient from './createRedisClient'
import RedisStore from './RedisStore'

export default class TokenStore extends RedisStore {
  constructor(redisClient: redis.RedisClient = createRedisClient('systemToken:')) {
    super(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    return this.setRedisAsync(key, token, 'EX', durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getRedisAsync(key)
  }
}
