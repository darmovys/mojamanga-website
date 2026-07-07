import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import z from 'zod'
import { TeamStatus } from '@/generated/prisma/enums'

export const usersRouter = new Elysia({
  name: 'users-router',
  tags: ['Users'],
})
  .use(betterAuthPlugin)
  .group('/users', (app) => {
    return app
      .get(
        '/user/:id',
        async ({ params: { id }, status, user }) => {
          const isMe = id === user?.id

          const userData = await prisma.user.findUnique({
            where: { id },
            omit: {
              username: true,
              name: true,
            },
            include: {
              _count: {
                select: {
                  bookmarks: true,
                  comments: true,
                  likes: true,
                  titleAddings: { where: { approvalStatus: 'APPROVED' } },
                  uploadedChapters: { where: { approvalStatus: 'APPROVED' } },
                },
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
      .get(
        '/user/:id/teams',
        async ({ params: { id }, status, user }) => {
          const isMe = id === user?.id

          const teamStatusFilter = isMe
            ? undefined
            : { in: [TeamStatus.APPROVED, TeamStatus.BANNED] }

          const userData = await prisma.user.findUnique({
            where: { id },
            select: {
              teamMemberships: {
                where: {
                  team: {
                    status: teamStatusFilter,
                  },
                },
                select: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      status: true,
                      coverUrl: true,
                      _count: { select: { members: true } },
                    },
                  },
                },
              },
            },
          })

          if (!userData) {
            return status(404, 'Такого користувача не знайдено')
          }

          const teams = userData.teamMemberships.map(
            (membership) => membership.team,
          )

          return teams
        },
        {
          optionalAuth: true,
          params: z.object({
            id: z.string(),
          }),
        },
      )
  })
