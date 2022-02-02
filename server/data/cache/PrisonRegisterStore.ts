import redis from 'redis'
import type { Prison } from 'prisonTypes'
import createRedisClient from './createRedisClient'
import RedisStore from './RedisStore'

const ACTIVE_PRISONS = 'activePrisons'

export default class PrisonRegisterStore extends RedisStore {
  constructor(redisClient: redis.RedisClient = createRedisClient('prisonRegister:')) {
    super(redisClient)
  }

  public async setActivePrisons(activePrisons: Array<Prison>, durationDays = 1): Promise<void> {
    return this.setRedisAsync(ACTIVE_PRISONS, JSON.stringify(activePrisons), 'EX', durationDays * 24 * 60 * 60)
  }

  public async getActivePrisons(): Promise<Array<Prison>> {
    return this.getRedisAsync(ACTIVE_PRISONS).then(serializedData => JSON.parse(serializedData) as Array<Prison>)
  }
}
