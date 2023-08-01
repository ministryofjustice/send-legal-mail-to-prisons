import crypto from 'crypto'
import { Request } from 'express'
import redis from 'redis'
import createRedisClient from './createRedisClient'
import RedisStore from './RedisStore'
import config from '../../config'

const SMOKE_TEST = 'smokeTest'

export default class SmokeTestStore extends RedisStore {
  constructor(redisClient: redis.RedisClient = createRedisClient(`${SMOKE_TEST}:`)) {
    super(redisClient)
  }

  async setSmokeTestSecret(oneTimeSecret: string): Promise<void> {
    return this.setRedisAsync(SMOKE_TEST, oneTimeSecret, 'EX', 60)
  }

  public async getSmokeTestSecret(): Promise<string> {
    const secret = this.getRedisAsync(SMOKE_TEST)
    this.deleteEntry(SMOKE_TEST)
    return secret
  }

  public async startSmokeTest(req: Request): Promise<string> {
    if (!req.body?.msjSecret || !config.smoketest.msjSecret) return ''
    const secret = req.body.msjSecret
    if (secret === config.smoketest.msjSecret) {
      const oneTimeSecret = crypto.randomBytes(20).toString('hex')
      await this.setSmokeTestSecret(oneTimeSecret)
      return oneTimeSecret
    }
    return ''
  }
}
