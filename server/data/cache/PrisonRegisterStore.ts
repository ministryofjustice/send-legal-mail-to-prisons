import type { Prison } from 'prisonTypes'
import type { RedisClient } from '../redisClient'

import logger from '../../../logger'

export default class PrisonRegisterStore {
  private readonly prefix = 'prisonRegister:'

  private readonly ACTIVE_PRISONS = 'activePrisons'

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

  public async setActivePrisons(activePrisons: Array<Prison>, durationDays = 1): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${this.ACTIVE_PRISONS}`, JSON.stringify(activePrisons), {
      EX: durationDays * 24 * 60 * 60,
    })
  }

  public async getToken(key: string): Promise<string> {
    await this.ensureConnected()
    const token = await this.client.get(`${this.prefix}${key}`)

    if (token === undefined || token === null) return ''

    return typeof token === 'string' ? token : (await token).toString()
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    await this.ensureConnected()

    const activePrisons = await this.getToken(this.ACTIVE_PRISONS)

    return activePrisons.length > 0 ? (JSON.parse(activePrisons) as Array<Prison>) : null
  }
}
