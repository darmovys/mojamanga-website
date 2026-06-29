import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import z from 'zod'

export const usersRouter = new Elysia({
  name: 'users-router',
  tags: ['Users'],
})
  .use(betterAuthPlugin)
  .group('/users', (app) => {
    return app.get(
      '/user/:id',
      async ({ params: { id }, status, user }) => {
        let isMe = false

        if (id === user?.id) {
          isMe = true
        }

        const userData = await prisma.user.findUnique({
          where: { id },
          omit: {
            username: true,
            name: true,
          },
          include: {
            _count: {
              select: { bookmarks: true, comments: true, likes: true },
            },
          },
        })

        if (!userData) {
          return status(404, 'Такого користувача не знайдено')
        }

        if (isMe) {
          return {
            isMe: true as const,
            user: userData,
          }
        }

        const { email, emailVerified, ...publicUserData } = userData

        return {
          isMe: false as const,
          user: publicUserData,
        }
      },
      {
        optionalAuth: true,
        params: z.object({
          id: z.string(),
        }),
      },
    )
  })
