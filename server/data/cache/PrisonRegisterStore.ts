import type { Prison } from 'prisonTypes'
import type { RedisClient } from '../redisClient'

import logger from '../../../logger'
import PrisonRegisterStoreFunctions from './prisonRegisterStoreFunctions'

export default class PrisonRegisterStore implements PrisonRegisterStoreFunctions {
  private readonly prefix = 'prisonRegister:'

  private readonly ACTIVE_PRISONS = 'activePrisons'

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
    await this.client.set(`${this.prefix}${this.ACTIVE_PRISONS}`, JSON.stringify(activePrisons), {
      EX: durationDays * 24 * 60 * 60,
    })
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    await this.ensureConnected()

    const activePrisons = await this.client.get(`${this.prefix}${this.ACTIVE_PRISONS}`)

    return JSON.parse(activePrisons) as Array<Prison>
  }
}
