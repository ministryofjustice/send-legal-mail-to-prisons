import type { Prison } from 'prisonTypes'
import type { RedisClient } from '../redisClient'

import logger from '../../../logger'

export default class PrisonRegisterStore {
  private readonly prefix = 'prisonRegister:'

  private readonly key = 'activePrisons'

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

  public async setActivePrisons(activePrisons: Array<Prison>, durationDays = 1) {
    await this.ensureConnected()
    this.client.set(`${this.prefix}${this.key}`, JSON.stringify(activePrisons), {
      EX: durationDays * 24 * 60 * 60,
    })
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    await this.ensureConnected()
    return this.client
      .get(`${this.prefix}${this.key}`)
      .then(serializedData => JSON.parse(serializedData) as Array<Prison>)
  }
}
