import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import { moveS3File } from '@/lib/utils'
import { S3 } from '@/lib/s3-client'
import { addTitleSchema } from '@/schemas/titles'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export const titlesRouter = new Elysia({
  name: 'titles-router',
  tags: ['Titles'],
})
  .use(betterAuthPlugin)
  .group('/titles', (app) => {
    return app.post(
      '/add-new-title',
      async ({ body, status, user }) => {
        // Отримуємо інформацію про авторизованого користувача, та про твори, що він додав
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { titleAddings: true },
        })

        // Виходимо в разі, якщо з якоїсь причини користувача не знайдено
        if (!dbUser) return status(404, 'Користувача не знайдено')

        // Забороняємо обмеженим в доступі користувачам пропонувати твори
        if (dbUser.status === 'RESTRICTED' || dbUser.status === 'BANNED')
          return status(
            403,
            'Обмежені в доступі користувачі не можуть додавати твори',
          )

        /* 
          Перевіряємо чи цей користувач вже не надсилав запит 
          на додавання роботи, який ще не був пеервірений модерацією 
        */
        const userTitleAddings = dbUser.titleAddings
        if (
          userTitleAddings.some((title) => title.approvalStatus === 'PENDING')
        )
          return status(
            403,
            'У вас вже є запит на перевірці. Дочекайтеся його результату',
          )

        // Перевіряємо чи цей користувач не має відхиленого запиту на доопрацювання
        if (
          userTitleAddings.some((title) => title.approvalStatus === 'REJECTED')
        )
          return status(
            403,
            'У вас є відхилені запити. Переробіть їх, або скасуйте повністю на сторінці профілю',
          )

        // Перевіряємо що користувач є членом усіх зазначених команд
        const teamIds = body.teams.map((t) => t.id)

        const memberships = await prisma.teamMember.findMany({
          where: {
            userId: user.id,
            teamId: { in: teamIds },
          },
          select: { teamId: true },
        })

        const joinedTeamIds = new Set(memberships.map((m) => m.teamId))
        const notMemberOf = teamIds.filter((id) => !joinedTeamIds.has(id))

        if (notMemberOf.length > 0) {
          return status(403, 'Ви не є членом усіх зазначених команд')
        }

        // Розбиваємо рядок альтернативних назв на масив назв
        const alternativeNames = body.alternativeNames
          ? body.alternativeNames
              .split(' / ')
              .map((name) => name.trim())
              .filter(Boolean)
          : []

        // Створюємо ідентифікатор твору, що зберігатиметься в БД
        const titleId = createId()

        // Створюємо папку для збереження зображень твору
        const titlesFolder = `uploads/titles/${body.enName}-${titleId}`

        // Створюємо новий ключ для обкладинки твору
        const coverFileName = body.coverKey.split('/').pop()
        const newCoverKey = `${titlesFolder}/cover/${coverFileName}`

        // Переносимо зображення з тимчасової папки у папку твору
        const isCoverMoved = await moveS3File(body.coverKey, newCoverKey)
        if (!isCoverMoved) {
          return status(500, 'Не вдалося зберегти обкладинку твору')
        }

        let newBackgroundKey = null
        // Якщо було надано фонове зображення
        if (body.backgroundKey) {
          // Створюємо новий ключ для фонового зображення твору
          const bgFileName = body.backgroundKey.split('/').pop()
          newBackgroundKey = `${titlesFolder}/background/${bgFileName}`

          // Переносимо зображення з тимчасової папки у папку твору
          const isBgMoved = await moveS3File(
            body.backgroundKey,
            newBackgroundKey,
          )
          if (!isBgMoved) {
            return status(500, 'Не вдалося зберегти фонове зображення твору')
          }
        }

        try {
          const titleVersionId = createId()

          await prisma.title.create({
            data: {
              id: titleId,
              proposedByUserId: user.id,

              versions: {
                create: {
                  id: titleVersionId,
                  editorId: user.id,
                  nameUkr: body.ukrName,
                  nameEng: body.enName,
                  description: body.description || null,
                  coverUrl: newCoverKey,
                  backgroundUrl: newBackgroundKey,
                  releaseYear: parseInt(body.releaseYear),
                  type: body.type,
                  ageRestriction: body.ageRestriction,
                  titleStatus: body.titleStatus,
                  translationStatus: body.translationStatus,

                  alternativeNames: {
                    create: alternativeNames.map((name) => ({ name })),
                  },

                  genres: {
                    create: body.genres.map((g) => ({ genreId: g.id })),
                  },

                  tags: {
                    create: body.tags.map((t) => ({ tagId: t.id })),
                  },

                  people: {
                    create: [
                      ...body.authors.map((p) => ({
                        personId: p.id,
                        role: 'AUTHOR' as const,
                      })),
                      ...body.artists.map((p) => ({
                        personId: p.id,
                        role: 'ARTIST' as const,
                      })),
                    ],
                  },
                },
              },

              publishers: {
                create: teamIds.map((teamId) => ({ teamId })),
              },
            },

            include: {
              versions: { select: { id: true } },
            },
          })

          await prisma.title.update({
            where: { id: titleId },
            data: { currentVersionId: titleVersionId },
          })

          return {
            message: 'Запит на додавання твору відправлено',
          }
        } catch (dbError) {
          console.error('Помилка БД: ', dbError)

          // Прибираємо вже переміщені файли щоб не засмічувати S3
          const deleteCommands = [
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: newCoverKey,
            }),
          ]

          if (newBackgroundKey) {
            deleteCommands.push(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: newBackgroundKey,
              }),
            )
          }

          await Promise.allSettled(
            deleteCommands.map((command) => S3.send(command)),
          )

          return status(500, 'Помилка під час збереження даних')
        }
      },
      {
        authed: true,
        body: addTitleSchema,
      },
    )
  })
