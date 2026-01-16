import crypto from 'crypto'
import { Request } from 'express'
import type { RedisClient } from '../redisClient'

import logger from '../../../logger'
import config from '../../config'

export default class SmokeTestStore {
  private readonly prefix = 'smokeTest:'

  private readonly SMOKE_TEST = 'smokeTest'

  constructor(private readonly client: RedisClient) {
    logger.info(`${this.prefix}Create RedisStore`)
    client.on('error', error => {
      logger.error(error, `${this.prefix}Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string> {
    await this.ensureConnected()
    const token = await this.client.get(`${this.prefix}${key}`)

    if (token === undefined || token === null) return ''

    return typeof token === 'string' ? token : (await token).toString('base64')
  }

  async setSmokeTestSecret(oneTimeSecret: string): Promise<void> {
    await this.client.set(`${this.prefix}${this.SMOKE_TEST}`, oneTimeSecret, { EX: 60 })
  }

  public async getSmokeTestSecret(): Promise<string> {
    const secret = this.getToken(this.SMOKE_TEST)

    this.client.del(`${this.prefix}${this.SMOKE_TEST}`)

    return secret
  }

  public async startSmokeTest(req: Request): Promise<string> {
    if (!req.body?.msjSecret || !config.smoketest.msjSecret) {
      return ''
    }

    const secret = req.body?.msjSecret

    if (secret !== config.smoketest.msjSecret) {
      return ''
    }

    const oneTimeSecret = crypto.randomBytes(20).toString('hex')

    await this.setSmokeTestSecret(oneTimeSecret)

    return oneTimeSecret
  }
}
