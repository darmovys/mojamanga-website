import { createIsomorphicFn } from '@tanstack/react-start'
import { treaty } from '@elysiajs/eden'
import { app } from '@/server/elysia'

export const api = createIsomorphicFn()
  .server(() => treaty(app).api)
  .client(() => treaty<typeof app>(import.meta.env.VITE_SITE_URL).api)

export type Api = ReturnType<typeof treaty<typeof app>>['api']
