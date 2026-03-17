import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit } from '../rate-limit'
import { redis } from '../redis'

vi.mock('../redis', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
}))

describe('Rate Limiting Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow requests within the limit', async () => {
    vi.mocked(redis.incr).mockResolvedValue(1)
    
    const result = await rateLimit('test-ip', 5)
    
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(redis.expire).toHaveBeenCalled()
  })

  it('should block requests exceeding the limit', async () => {
    vi.mocked(redis.incr).mockResolvedValue(6)
    
    const result = await rateLimit('test-ip', 5)
    
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should not call expire on subsequent requests', async () => {
    vi.mocked(redis.incr).mockResolvedValue(2)
    
    await rateLimit('test-ip', 5)
    
    expect(redis.expire).not.toHaveBeenCalled()
  })
})
