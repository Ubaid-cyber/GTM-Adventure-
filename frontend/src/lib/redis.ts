import { Redis } from 'ioredis'

const getRedisUrl = () => process.env.REDIS_URL || null

const globalForRedis = global as unknown as { redis: Redis | null }

const redisUrl = getRedisUrl()

export const redis =
  redisUrl ? (globalForRedis.redis || new Redis(redisUrl, { maxRetriesPerRequest: 1 })) : null

if (process.env.NODE_ENV !== 'production' && redis) {
  globalForRedis.redis = redis
}

export const isRedisReady = () => !!redis
