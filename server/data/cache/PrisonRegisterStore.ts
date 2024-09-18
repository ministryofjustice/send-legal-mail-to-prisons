import type { Prison } from 'prisonTypes'
import { createRedisClient, RedisClient } from '../redisClient'
import RedisStore from './RedisStore'

export default class PrisonRegisterStore extends RedisStore {
  private readonly prefix = 'prisonRegister:'

  private readonly ACTIVE_PRISONS = 'activePrisons:'

  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  public setActivePrisons(activePrisons: Array<Prison>, durationDays = 1) {
    this.setRedisAsync(
      `${this.prefix}${this.ACTIVE_PRISONS}`,
      JSON.stringify(activePrisons),
      'EX',
      durationDays * 24 * 60 * 60
    )
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    return this.getRedisAsync(`${this.prefix}${this.ACTIVE_PRISONS}`).then(
      serializedData => JSON.parse(serializedData) as Array<Prison>
    )
  }
}
