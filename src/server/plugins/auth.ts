import { auth } from '@/lib/auth'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const betterAuthPlugin = new Elysia({
  name: 'better-auth',
  tags: ['Auth'],
})
  .use(
    cors({
      origin: process.env.SITE_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .macro({
    authed: {
      async resolve({ status }) {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({
          headers,
        })
        if (!session) return status(401, 'Необхідна авторизація')
        return {
          user: session.user,
          session: session.session,
        }
      },
    },
    moderator: {
      async resolve({ status }) {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session) return status(401, 'Необхідна авторизація')

        const { role } = session.user
        if (role !== 'ADMIN' && role !== 'MODERATOR') {
          return status(403, 'Доступ заборонено: потрібні права модератора або адміна')
        }

        return {
          user: session.user,
          session: session.session,
        }
      },
    },
  })
  .get('/user_session', async () => {
    const headers = getRequestHeaders()

    const userSession = await auth.api.getSession({ headers: headers })

    if (userSession?.user) {
      return {
        isAuthenticated: true as const,
        user: userSession.user,
        session: userSession.session,
      }
    }

    return {
      isAuthenticated: false as const,
      user: undefined,
      session: undefined,
    }
  })

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
  getPaths: (prefix = '/api/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method]

          operation.tags = ['Better Auth']
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const
