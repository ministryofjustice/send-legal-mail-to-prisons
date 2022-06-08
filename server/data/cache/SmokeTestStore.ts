import { Request } from 'express'
import crypto from 'crypto'
import RedisStore from './RedisStore'
import config from '../../config'
import { createRedisClient, RedisClient } from './RedisClient'

const KEY = 'smokeTest'

export default class SmokeTestStore extends RedisStore {
  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  async setSmokeTestSecret(oneTimeSecret: string): Promise<void> {
    return this.setEntry(KEY, oneTimeSecret, 60)
  }

  public async getSmokeTestSecret(): Promise<string> {
    const secret = await this.getEntry(KEY)
    await this.deleteEntry(KEY)
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
