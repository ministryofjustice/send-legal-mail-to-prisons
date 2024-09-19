import crypto from 'crypto'
import { Request } from 'express'
import { createRedisClient, RedisClient } from '../redisClient'
import RedisStore from './RedisStore'
import config from '../../config'

const SMOKE_TEST = 'smokeTest'

export default class SmokeTestStore extends RedisStore {
  private readonly prefix = 'smokeTest:'

  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  async setSmokeTestSecret(oneTimeSecret: string): Promise<void> {
    return this.setRedisAsync(`${this.prefix}${SMOKE_TEST}`, oneTimeSecret, 'EX', 60)
  }

  public async getSmokeTestSecret(): Promise<string> {
    const secret = this.getRedisAsync(`${this.prefix}${SMOKE_TEST}`)
    this.deleteEntry(`${this.prefix}${SMOKE_TEST}`)
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
