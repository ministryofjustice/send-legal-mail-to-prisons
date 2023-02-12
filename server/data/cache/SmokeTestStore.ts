import { Request } from 'express'
import crypto from 'crypto'
import type { RedisClient } from './redisClient'
import logger from '../../../logger'
import config from '../../config'

const SMOKE_TEST = 'smokeTest'

export default class SmokeTestStore {
  private readonly prefix = `${SMOKE_TEST}:`

  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setSmokeTestSecret(oneTimeSecret: string): Promise<void> {
    await this.ensureConnected()
    const key = `${this.prefix}${SMOKE_TEST}`
    await this.client.set(key, oneTimeSecret, { EX: 60 })
  }

  public async getSmokeTestSecret(): Promise<string> {
    await this.ensureConnected()
    const key = `${this.prefix}${SMOKE_TEST}`
    const secret = await this.client.get(key)
    await this.client.del(key)
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
