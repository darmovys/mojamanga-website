import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { createTeamSchema } from '@/schemas/teams'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import { moveS3File, ukrainianToLatin } from '@/lib/utils'
import z from 'zod'
import { DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { S3 } from '@/lib/s3-client'

async function getTeamOrFail(id: string) {
  const team = await prisma.team.findUnique({ where: { id } })

  if (!team) return 'NOT_FOUND' as const
  if (team.status !== 'PENDING') return 'NOT_PENDING' as const

  return team
}

export const teamsRouter = new Elysia({
  name: 'teams-router',
  tags: ['Teams'],
})
  .use(betterAuthPlugin)
  .group('/teams', (app) => {
    return app
      .post(
        '/create-team',
        async ({ body, status, user }) => {
          const trimmedTitle = body.title.trim()

          if (body.links.find((el) => el.url === '' || el.type === null)) {
            return status('Bad Request', 'Заповніть усі відкриті поля посилань')
          }

          const [dbUser, existingTeam] = await Promise.all([
            prisma.user.findUnique({
              where: { id: user.id },
              include: { teamMemberships: { include: { team: true } } },
            }),
            prisma.team.findFirst({
              where: { name: { equals: trimmedTitle, mode: 'insensitive' } },
            }),
          ])

          if (!dbUser) return status(404, 'Користувача не знайдено')
          if (dbUser.status === 'BANNED')
            return status(
              403,
              'Обмежені в доступі користувачі не можуть створювати команди',
            )

          if (existingTeam) {
            return status(409, 'Команда з такою назвою вже існує')
          }

          const userTeams = dbUser.teamMemberships
          if (userTeams.some((m) => m.team.status === 'PENDING'))
            return status(
              403,
              'У вас вже є запит на перевірці. Дочекайтеся його результату',
            )
          if (userTeams.some((m) => m.team.status === 'REJECTED'))
            return status(
              403,
              'У вас є відхилені запити. Переробіть їх або скасуйте повністю на сторінці профілю',
            )
          if (userTeams.length >= 3) {
            return status(403, 'Не можна бути учасником більше ніж 3 команд')
          }

          const teamId = createId()
          const latinizedName = ukrainianToLatin(body.title)

          const teamFolder = `uploads/teams/${latinizedName}-${teamId}`

          const avatarFileName = body.avatarKey.split('/').pop()
          const newAvatarKey = `${teamFolder}/cover/${avatarFileName}`

          const isAvatarMoved = await moveS3File(body.avatarKey, newAvatarKey)
          if (!isAvatarMoved) {
            return status(500, 'Не вдалося зберегти обкладинку команди')
          }

          let newBackgroundKey = null
          if (body.backgroundKey) {
            const bgFileName = body.backgroundKey.split('/').pop()
            newBackgroundKey = `${teamFolder}/background/${bgFileName}`

            const isBgMoved = await moveS3File(
              body.backgroundKey,
              newBackgroundKey,
            )
            if (!isBgMoved) {
              return status(
                500,
                'Не вдалося зберегти фонове зображення команди',
              )
            }
          }

          try {
            await prisma.team.create({
              data: {
                id: teamId,
                name: trimmedTitle,
                description: body.description,
                coverUrl: newAvatarKey,
                backgroundUrl: newBackgroundKey,
                status: 'PENDING',
                creatorId: user.id,

                members: {
                  create: {
                    userId: user.id,
                    roles: ['ADMIN'],
                    canPublish: true,
                  },
                },

                links: {
                  create: body.links.map((link) => ({
                    type: link.type!,
                    url: link.url,
                  })),
                },
              },
            })

            return {
              message: 'Запит на створення команди відправлено',
            }
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }
        },
        {
          authed: true,
          body: createTeamSchema,
        },
      )
      .get(
        '/teams-to-attach',
        async ({ status, user }) => {
          try {
            const userTeams = await prisma.team.findMany({
              where: {
                status: 'APPROVED',
                members: {
                  some: {
                    userId: user.id,
                  },
                },
              },
              select: {
                id: true,
                name: true,
              },
            })

            return userTeams
          } catch (error) {
            console.error('Помилка при отриманні команд: ', error)
            return status(500, 'Помилка при отриманні команд')
          }
        },
        {
          authed: true,
        },
      )
      .get(
        '/get-pending-teams',
        async ({ query, status }) => {
          try {
            const page = query.page ?? 1
            const limit = 10
            const skip = (page - 1) * limit

            const [teams, total] = await Promise.all([
              prisma.team.findMany({
                where: { status: 'PENDING' },
                include: {
                  creator: { select: { displayUsername: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
              }),
              prisma.team.count({ where: { status: 'PENDING' } }),
            ])

            return {
              teams,
              total,
              totalPages: Math.ceil(total / limit),
              currentPage: page,
            }
          } catch (error) {
            console.error('Помилка при отриманні заявок: ', error)
            return status(500, 'Не вдалося завантажити список заявок')
          }
        },
        {
          query: z.object({
            page: z.coerce.number().optional(),
          }),
          moderator: true,
        },
      )
      .get(
        '/team-creation-request/:id',
        async ({ params: { id }, status }) => {
          const teamData = await prisma.team.findFirst({
            where: {
              AND: { id, status: 'PENDING' },
            },
            include: {
              creator: { select: { image: true, displayUsername: true } },
              links: true,
            },
          })
          if (!teamData) {
            return status(404, 'Такої заявки не знайдено')
          }
          return teamData
        },
        {
          params: z.object({
            id: z.string(),
          }),
        },
      )
      .patch(
        '/approve-team-request',
        async ({ status, body }) => {
          try {
            const team = await getTeamOrFail(body.id)
            if (team === 'NOT_FOUND') return status(404, 'Команду не знайдено')
            if (team === 'NOT_PENDING')
              return status(409, 'Запит вже оброблено')

            await prisma.team.update({
              where: { id: body.id },
              data: { status: 'APPROVED' },
            })

            return { message: 'Запит виконано' }
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }
        },
        {
          moderator: true,
          body: z.object({ id: z.string() }),
        },
      )
      .patch(
        '/revise-team-request',
        async ({ status, body }) => {
          try {
            const team = await getTeamOrFail(body.id)
            if (team === 'NOT_FOUND') return status(404, 'Команду не знайдено')
            if (team === 'NOT_PENDING')
              return status(409, 'Запит вже оброблено')

            await prisma.team.update({
              where: { id: body.id },
              data: {
                status: 'REJECTED',
                ...(body.message.length && { rejectionReason: body.message }),
              },
            })

            return {
              message: 'Запит виконано',
            }
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }
        },
        {
          moderator: true,
          body: z.object({
            id: z.string(),
            message: z.string(),
          }),
        },
      )
      .delete(
        '/decline-team-request',
        async ({ status, body }) => {
          const team = await getTeamOrFail(body.id)
          if (team === 'NOT_FOUND') return status(404, 'Команду не знайдено')
          if (team === 'NOT_PENDING') return status(409, 'Запит вже оброблено')

          try {
            await prisma.team.delete({
              where: { id: body.id },
            })
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }

          try {
            const rawKeys = [body.coverUrl, body.backgroundUrl]
            const validKeys = rawKeys.filter(
              (key): key is string =>
                typeof key === 'string' && key.trim() !== '',
            )

            if (validKeys.length > 0) {
              const objectsPayload = validKeys.map((key) => ({ Key: key }))

              const command = new DeleteObjectsCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Delete: {
                  Objects: objectsPayload,
                  Quiet: true,
                },
              })

              await S3.send(command)
            }

            return { message: 'Запит виконано' }
          } catch (s3Error) {
            console.error('Помилка S3 (файли могли залишитися): ', s3Error)
            return status(500, 'Помилка при спробі видалити зображення')
          }
        },
        {
          moderator: true,
          body: z.object({
            id: z.string(),
            message: z.string(),
            coverUrl: z.string().nullable(),
            backgroundUrl: z.string().nullable(),
          }),
        },
      )
  })
