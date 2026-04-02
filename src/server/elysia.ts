import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { betterAuthPlugin } from './plugins/auth'
import { OpenAPI } from './plugins/auth'
import { filesRouter } from './routes/files'

export const app = new Elysia({
  prefix: '/api',
})
  .use(
    openapi({
      path: '/reference',
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(betterAuthPlugin)
  .use(filesRouter)
