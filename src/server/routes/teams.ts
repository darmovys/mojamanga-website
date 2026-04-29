import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { createTeamSchema } from '@/schemas/teams'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import { S3 } from '@/lib/s3-client'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ukrainianToLatin } from '@/lib/utils'
import z from 'zod'

async function moveS3File(sourceKey: string, destinationKey: string) {
  try {
    await S3.send(
      new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        CopySource: `${process.env.S3_BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      }),
    )

    await S3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: sourceKey,
      }),
    )
    return true
  } catch (error) {
    console.error('Помилка переміщення файлу в S3: error')
    return false
  }
}

export const teamsRouter = new Elysia({
  name: 'teams-router',
  tags: ['Teams'],
})
  .use(betterAuthPlugin)
  .group('/teams', (app) => {
    return app.post(
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
            return status(500, 'Не вдалося зберегти фонове зображення команди')
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
      '/get-pending-teams',
      async ({query, status}) => {
        try {
          const page = query.page ?? 1
          const limit = 10
          const skip = (page - 1) * limit

          const [teams, total] = await Promise.all([
            prisma.team.findMany({
              where: {status: 'PENDING'},
              include: {
                creator: {select: {displayUsername: true}}
              },
              orderBy: {createdAt: 'desc'},
              skip,
              take: limit,
            }),
            prisma.team.count({where: {status: 'PENDING'}})
          ])

          return {
            teams,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
          }
        } catch (error) {
          console.error('Помилка при отриманні заявок: ', error)
          return status(500, 'Не вдалося завантажити список заявок')
        }
      },
      {
        query: z.object({
          page: z.coerce.number().optional()
        })
      }
    )
  })
