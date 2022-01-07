import { promisify } from 'util'
import redis from 'redis'
import logger from '../../../logger'

export default abstract class RedisStore {
  protected getRedisAsync: (key: string) => Promise<string>

  protected setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  protected constructor(private readonly redisClient: redis.RedisClient) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }
}
