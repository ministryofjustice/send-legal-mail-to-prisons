import redis from 'redis'
import type { PrisonAddress } from 'prisonTypes'
import createRedisClient from './createRedisClient'
import RedisStore from './RedisStore'

const ACTIVE_PRISONS = 'activePrisons'

export default class PrisonRegisterStore extends RedisStore {
  constructor(redisClient: redis.RedisClient = createRedisClient('prisonRegister:')) {
    super(redisClient)
  }

  public setActivePrisons(activePrisons: Array<PrisonAddress>, durationDays = 1) {
    this.setRedisAsync(ACTIVE_PRISONS, JSON.stringify(activePrisons), 'EX', durationDays * 24 * 60 * 60)
  }

  public async getActivePrisons(): Promise<Array<PrisonAddress>> {
    return this.getRedisAsync(ACTIVE_PRISONS).then(serializedData => JSON.parse(serializedData) as Array<PrisonAddress>)
  }
}
