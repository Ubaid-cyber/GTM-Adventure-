import { redis } from './redis'

/**
 * Rate limiting logic that safely handles missing Redis.
 * If Redis is not available, defaults to allowing the request.
 */
export async function rateLimit(identifier: string, limit: number = 5, windowInSeconds: number = 300) {
  if (!redis) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[RateLimit] Redis not configured. Skipping limit for: ${identifier}`);
    }
    return { success: true, remaining: limit };
  }

  const key = `ratelimit:${identifier}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowInSeconds)
    }
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count)
    }
  } catch (error) {
    console.error('[RateLimit] Error during Redis operation:', error);
    return { success: true, remaining: limit }
  }
}
