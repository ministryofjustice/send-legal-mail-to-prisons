import { promisify } from 'util'
import logger from '../../../logger'
import { RedisClient } from '../redisClient'

export default abstract class RedisStore {
  protected getRedisAsync: (key: string) => Promise<string>

  protected setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  protected constructor(private readonly redisClient: RedisClient) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }

  protected deleteEntry(key: string) {
    this.redisClient.del(key)
  }
}
