import type { Prison } from 'prisonTypes'
import RedisStore from './RedisStore'
import { createRedisClient, RedisClient } from './RedisClient'

const KEY = 'prisonRegister:activePrisons'

export default class PrisonRegisterStore extends RedisStore {
  constructor(redisClient: RedisClient = createRedisClient()) {
    super(redisClient)
  }

  public async setActivePrisons(activePrisons: Array<Prison>, durationDays = 1) {
    await this.setEntry(KEY, JSON.stringify(activePrisons), durationDays * 24 * 60 * 60)
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    return this.getEntry(KEY).then(serializedData => JSON.parse(serializedData) as Array<Prison>)
  }
}
