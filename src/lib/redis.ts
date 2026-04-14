import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const uploadTeamImageRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, '5 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/files-upload/team-image',
})
