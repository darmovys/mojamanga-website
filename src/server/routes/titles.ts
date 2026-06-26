import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import { moveS3File } from '@/lib/utils'
import { S3 } from '@/lib/s3-client'
import { addTitleSchema } from '@/schemas/titles'
import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'
import { TitleFieldName } from '@/generated/prisma/enums'

const titleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  proposedByUser: z.object({
    displayUsername: z.string(),
  }),
  currentVersion: z.object({
    nameUkr: z.string(),
    nameEng: z.string(),
    description: z.string().nullable(),
  }),
})

// Схема виведених даних для маршруту get-pending-titles
const titlesSchema = z.object({
  titles: z.array(titleSchema),
  total: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
})

async function getTitleOrFail(id: string) {
  const title = await prisma.title.findUnique({ where: { id } })

  if (!title) return 'NOT_FOUND' as const
  if (title.approvalStatus !== 'PENDING') return 'NOT_PENDING' as const

  return title
}

export const titlesRouter = new Elysia({
  name: 'titles-router',
  tags: ['Titles'],
})
  .use(betterAuthPlugin)
  .group('/titles', (app) => {
    return app
      .post(
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
            userTitleAddings.some(
              (title) => title.approvalStatus === 'REJECTED',
            )
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

                    sources: {
                      create: body.sources.map((source) => ({
                        url: source.url,
                      })),
                    },

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

            /* 
              Поле currentVersion може бути null. 
              Це пов'язано зі структурою бази даних.
              Та на практиці ми ніколи не хочемо щоб воно мало це значення null.
              Тому для нашої нової роботи ми відразу створюємо зв'язок з titleVersion.
             */
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
      .get(
        '/get-pending-titles',
        async ({ query, status }) => {
          try {
            const page = query.page ?? 1
            const limit = 10
            const skip = (page - 1) * limit

            const [rawTitles, total] = await Promise.all([
              prisma.title.findMany({
                where: {
                  AND: [
                    { approvalStatus: 'PENDING' },
                    { currentVersion: { isNot: null } },
                  ],
                },
                select: {
                  id: true,
                  createdAt: true,
                  currentVersion: {
                    select: { nameUkr: true, nameEng: true, description: true },
                  },
                  proposedByUser: { select: { displayUsername: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
              }),
              prisma.title.count({ where: { approvalStatus: 'PENDING' } }),
            ])

            /* 
              Наразі, Prisma не вміє звужувати типи в момент фільтраці даних під час запиту до БД.
              Тому хоч ми і вказали, що currentVersion: { isNot: null }, 
              TypeScript все ще вважатиме, що currentVersion може бути null.
              Код знизу змушує TypeScript важати, що значення ніколи не буде null.
            */
            const titles = rawTitles.map((title) => ({
              ...title,
              currentVersion: title.currentVersion!, // Знак оклику каже: "Тут точно не null"
            }))

            return {
              titles,
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
          /* за допомогою zod, виводимо тип даних, де currentVersion !== null */
          response: {
            200: titlesSchema,
            500: z.string(),
          },
          moderator: true,
        },
      )
      .get(
        '/title-adding-request/:id',
        async ({ params: { id }, status }) => {
          const titleRawData = await prisma.title.findFirst({
            where: {
              AND: [
                { id, approvalStatus: 'PENDING' },
                { currentVersion: { isNot: null } },
              ],
            },
            include: {
              proposedByUser: {
                select: { image: true, displayUsername: true },
              },
              lockedFields: {
                select: { fieldName: true },
              },
              currentVersion: {
                select: {
                  coverUrl: true,
                  backgroundUrl: true,
                  nameUkr: true,
                  nameEng: true,
                  alternativeNames: { select: { id: true, name: true } },
                  description: true,
                  type: true,
                  titleStatus: true,
                  translationStatus: true,
                  ageRestriction: true,
                  releaseYear: true,
                  genres: {
                    select: { genre: { select: { id: true, name: true } } },
                  },
                  tags: {
                    select: { tag: { select: { id: true, name: true } } },
                  },
                  sources: {
                    select: { id: true, url: true },
                  },
                  people: {
                    select: {
                      personId: true,
                      role: true,
                      person: { select: { nameUkr: true } },
                    },
                  },
                },
              },
              publishers: {
                select: { team: { select: { id: true, name: true } } },
              },
            },
          })

          if (!titleRawData) {
            return status(404, 'Такої заявки не знайдено')
          }

          const titleData = titleRawData as Omit<
            typeof titleRawData,
            'currentVersion'
          > & {
            currentVersion: NonNullable<typeof titleRawData.currentVersion>
          }

          return titleData
        },
        {
          moderator: true,
          params: z.object({
            id: z.string(),
          }),
        },
      )
      .patch(
        '/approve-title-request',
        async ({ status, body }) => {
          try {
            const title = await getTitleOrFail(body.id)
            if (title === 'NOT_FOUND') return status(404, 'Твір не знайдено')
            if (title === 'NOT_PENDING')
              return status(409, 'Запит вже оброблено')

            await prisma.title.update({
              where: { id: body.id },
              data: { approvalStatus: 'APPROVED' },
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
        '/revise-title-request',
        async ({ status, body }) => {
          try {
            const title = await getTitleOrFail(body.id)
            if (title === 'NOT_FOUND') return status(404, 'Твір не знайдено')
            if (title === 'NOT_PENDING')
              return status(409, 'Запит вже оброблено')

            await prisma.title.update({
              where: { id: body.id },
              data: {
                approvalStatus: 'REJECTED',
                lockedFields: {
                  deleteMany: {},
                  create: body.lockedFields.map((f) => ({ fieldName: f })),
                },
                ...(body.message.length && {
                  moderationFeedback: body.message,
                }),
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
            lockedFields: z.array(z.enum(TitleFieldName)),
          }),
        },
      )
      .delete(
        '/decline-title-request',
        async ({ status, body }) => {
          const title = await getTitleOrFail(body.id)
          if (title === 'NOT_FOUND') return status(404, 'Твір не знайдено')
          if (title === 'NOT_PENDING') return status(409, 'Запит вже оброблено')

          try {
            await prisma.title.delete({
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
