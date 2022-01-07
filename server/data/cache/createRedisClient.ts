import redis from 'redis'
import config from '../../config'

const createRedisClient = (prefix: string): redis.RedisClient => {
  return redis.createClient({
    port: config.redis.port,
    password: config.redis.password,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true' ? {} : false,
    prefix,
  })
}

export default createRedisClient
