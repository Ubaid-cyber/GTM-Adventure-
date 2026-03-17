import { redis } from './redis'

export async function rateLimit(identifier: string, limit: number = 5, windowInSeconds: number = 300) {
  const key = `ratelimit:${identifier}`
  const count = await redis.incr(key)
  
  if (count === 1) {
    await redis.expire(key, windowInSeconds)
  }
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count)
  }
}
