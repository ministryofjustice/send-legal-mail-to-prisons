import { Request } from 'express'
import crypto from 'crypto'

import type { RedisClient } from '../redisClient'

import logger from '../../../logger'
import config from '../../config'

export default class SmokeTestStore {
  private readonly prefix = 'smokeTest:'

  private readonly key = 'smokeTest:'

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
    await this.client.set(`${this.prefix}${this.key}`, oneTimeSecret, { EX: 60 })
  }

  public async getSmokeTestSecret(): Promise<string> {
    await this.ensureConnected()
    const secret = this.client.get(`${this.prefix}${this.key}`)
    this.client.del(`${this.prefix}${this.key}`)
    return secret
  }

  public async startSmokeTest(req: Request): Promise<string> {
    await this.ensureConnected()
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
