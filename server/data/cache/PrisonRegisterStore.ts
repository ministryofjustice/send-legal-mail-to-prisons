import type { Prison } from 'prisonTypes'
import type { RedisClient } from './redisClient'
import logger from '../../../logger'

const ACTIVE_PRISONS = 'activePrisons'

export default class PrisonRegisterStore {
  private readonly prefix = 'prisonRegister:'

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

  public async setActivePrisons(activePrisons: Array<Prison>, durationDays = 1): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${ACTIVE_PRISONS}`, JSON.stringify(activePrisons), {
      EX: durationDays * 24 * 60 * 60,
    })
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    await this.ensureConnected()
    return this.client
      .get(`${this.prefix}${ACTIVE_PRISONS}`)
      .then(serializedData => JSON.parse(serializedData) as Array<Prison>)
  }
}
