import Elysia from 'elysia'
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'

const limitersCache = new Map<string, RateLimiterMemory>()

function getOrCreateLimiter(
  points: number,
  duration: number,
): RateLimiterMemory {
  const cahceKey = `${points}:${duration}`
  let limiter = limitersCache.get(cahceKey)

  if (!limiter) {
    limiter = new RateLimiterMemory({ points, duration })
    limitersCache.set(cahceKey, limiter)
  }

  return limiter
}

export class RateLimitError extends Error {
  public retryAfter: number

  constructor(message = 'Too Many Requests', retryAfter = 60) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

type AuthenticatedUser = {
  id: string
}

export const rateLimitPlugin = new Elysia({
  name: 'rate-limit',
})
  .error({
    RATE_LIMIT: RateLimitError,
  })
  .onError({ as: 'global' }, ({ code, error, set, status }) => {
    if (code === 'RATE_LIMIT') {
      set.headers['Retry-After'] = String(error.retryAfter)

      return status(429, error.message)
    }
  })
  .macro({
    /**
     * Обмежує кількість запитів для авторизованого користувача за його ID.
     *
     * ⚠️ **Важливо:** Цей макрос автоматично вмикає `authed: true`.
     * Додатково прописувати макрос `authed` у налаштуваннях маршруту **не потрібно**.
     *
     * @param options.points - Кількість дозволених запитів на вказаний період.
     * @param options.duration - Тривалість часового вікна у секундах.
     * @param options.message - (Опціонально) Текст помилки при перевищенні ліміту.
     */
    userRateLimit: (options: {
      points: number
      duration: number
      message?: string
    }) => ({
      authed: true,
      beforeHandle: async (context) => {
        // Elysia некоректно виводить властивість `user` з макросу `authed`,
        // коли `userRateLimit` визначений як параметризована фабрика макросу.
        // Тут ми зберігаємо початковий тип контексту та явно додаємо властивість
        // `user`, яку надає макрос `authed`.
        // TODO: Перевірити, чи потрібен цей type assertion після міграції на Elysia 2.0.0.
        const { user } = context as typeof context & {
          user: AuthenticatedUser
        }

        const { path, set } = context

        const limiter = getOrCreateLimiter(options.points, options.duration)

        const rateLimitKey = `${user.id}:${path}`

        try {
          const res: RateLimiterRes = await limiter.consume(rateLimitKey)

          set.headers['X-RateLimit-Limit'] = String(options.points)
          set.headers['X-RateLimit-Remaining'] = String(res.remainingPoints)
          set.headers['X-RateLimit-Reset'] = String(
            new Date(Date.now() + res.msBeforeNext).toISOString(),
          )
        } catch (error) {
          const rejRes = error as RateLimiterRes
          const retryAfterSec = Math.round(rejRes.msBeforeNext / 1000) || 1

          throw new RateLimitError(
            options.message ?? 'Забагато запитів. Спробуйте пізніше',
            retryAfterSec,
          )
        }
      },
    }),
  })
  .macro({
    /**
     * Обмежує кількість запитів для користувача за його IP-адресою.
     *
     * Використовуйте цей обмежувач, лише якщо маршрут де ви його вказуєте,
     * не вимагає обов'язкової авторизації користувача.
     * Інакше, використовуйте userRateLimit для більшої надійності.
     *
     * @param options.points - Кількість дозволених запитів на вказаний період.
     * @param options.duration - Тривалість часового вікна у секундах.
     * @param options.message - (Опціонально) Текст помилки при перевищенні ліміту.
     */
    ipRateLimit: (options: {
      points: number
      duration: number
      message?: string
    }) => ({
      beforeHandle: async ({ request, path, set }) => {
        const limiter = getOrCreateLimiter(options.points, options.duration)

        const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1'

        const rateLimitKey = `${clientIp}:${path}`

        try {
          const res: RateLimiterRes = await limiter.consume(rateLimitKey)

          set.headers['X-RateLimit-Limit'] = String(options.points)
          set.headers['X-RateLimit-Remaining'] = String(res.remainingPoints)
          set.headers['X-RateLimit-Reset'] = String(
            new Date(Date.now() + res.msBeforeNext).toISOString(),
          )
        } catch (error) {
          const rejRes = error as RateLimiterRes
          const retryAfterSec = Math.round(rejRes.msBeforeNext / 1000) || 1

          throw new RateLimitError(
            options.message ?? 'Забагато запитів. Спробуйте пізніше',
            retryAfterSec,
          )
        }
      },
    }),
  })
