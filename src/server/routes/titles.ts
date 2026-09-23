import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import { assertNonNullable, moveS3File, slugify } from '@/lib/utils'
import { S3 } from '@/lib/s3-client'
import { sendNewTitleDataSchema } from '@/schemas/titles'
import { bookmarkFolderSchema } from '@/schemas/bookmarks'
import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'
import { ChapterApprovalStatus, TitleFieldName } from '@/generated/prisma/enums'

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
          const titlesFolder = `uploads/titles/${slugify(body.enName)}--${titleId}`

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

            await prisma.$transaction(async (tx) => {
              await tx.title.create({
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
                Та на практиці ми ніколи не хочемо щоб воно мало таке значення.
                Тому для нашого нового твору ми відразу створюємо зв'язок з titleVersion.
              */
              await tx.title.update({
                where: { id: titleId },
                data: { currentVersionId: titleVersionId },
              })
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
          body: sendNewTitleDataSchema,
        },
      )
      .get(
        '/get-pending-titles',
        async ({ query, status }) => {
          try {
            const page = query.page ?? 1
            const limit = 10
            const skip = (page - 1) * limit

            const [rawTitles, total] = await prisma.$transaction([
              prisma.title.findMany({
                where: {
                  approvalStatus: 'PENDING',
                  currentVersion: { isNot: null },
                },
                select: {
                  id: true,
                  updatedAt: true,
                  currentVersion: {
                    select: { nameUkr: true, nameEng: true, description: true },
                  },
                  proposedByUser: { select: { displayUsername: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
              }),
              prisma.title.count({
                where: {
                  AND: [
                    { approvalStatus: 'PENDING' },
                    { currentVersion: { isNot: null } },
                  ],
                },
              }),
            ])

            const titles = rawTitles.map((title) => {
              assertNonNullable(title, ['currentVersion'])
              return title
            })

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
          moderator: true,
        },
      )
      .get(
        '/title-adding-request/:id',
        async ({ params: { id }, status }) => {
          try {
            const titleData = await prisma.title.findUnique({
              where: {
                id,
                approvalStatus: 'PENDING',
                currentVersion: { isNot: null },
              },
              select: {
                proposedByUserId: true,
                proposedByUser: {
                  select: { image: true, displayUsername: true },
                },
                lockedFields: true,
                updatedAt: true,
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

            if (!titleData || !titleData.currentVersion) {
              return status(404, 'Такої заявки не знайдено')
            }

            assertNonNullable(titleData, ['currentVersion'])

            return titleData
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при отриманні даних')
          }
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
                  set: [...new Set(body.lockedFields)],
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
      .group('/:id', (app) => {
        return app
          .get(
            '/editable-data',
            async ({ params: { id }, status, user }) => {
              try {
                const title = await prisma.title.findUnique({
                  where: {
                    id,
                    approvalStatus: 'REJECTED',
                    proposedByUserId: user.id,
                  },
                  select: {
                    id: true,
                    moderationFeedback: true,
                    lockedFields: true,
                    publishers: {
                      select: {
                        team: {
                          select: { id: true, name: true },
                        },
                      },
                    },
                    currentVersion: {
                      select: {
                        nameUkr: true,
                        nameEng: true,
                        description: true,
                        coverUrl: true,
                        backgroundUrl: true,
                        releaseYear: true,
                        type: true,
                        ageRestriction: true,
                        titleStatus: true,
                        translationStatus: true,
                        alternativeNames: {
                          select: {
                            name: true,
                          },
                        },
                        sources: {
                          select: {
                            id: true,
                            url: true,
                          },
                        },
                        tags: {
                          select: {
                            tag: { select: { name: true, id: true } },
                          },
                        },
                        genres: {
                          select: {
                            genre: { select: { name: true, id: true } },
                          },
                        },
                        people: {
                          select: {
                            person: {
                              select: {
                                id: true,
                                nameUkr: true,
                                nameLat: true,
                              },
                            },
                            role: true,
                          },
                        },
                      },
                    },
                  },
                })

                if (!title) {
                  return status(404, 'Твір не знайдено')
                }

                const { currentVersion, publishers, ...titleData } = title

                if (!currentVersion) {
                  return status(404, 'Дані версії твору відсутні')
                }

                return {
                  ...titleData,
                  coverUrl: currentVersion.coverUrl,
                  backgroundUrl: currentVersion.backgroundUrl,
                  nameUkr: currentVersion.nameUkr,
                  nameEng: currentVersion.nameEng,
                  alternativeNames: currentVersion.alternativeNames.map(
                    (a) => a.name,
                  ),
                  description: currentVersion.description,
                  type: currentVersion.type,
                  titleStatus: currentVersion.titleStatus,
                  translationStatus: currentVersion.translationStatus,
                  ageRestriction: currentVersion.ageRestriction,
                  releaseYear: currentVersion.releaseYear.toString(),
                  sources: currentVersion.sources,
                  genres: currentVersion.genres.map((g) => g.genre),
                  tags: currentVersion.tags.map((g) => g.tag),
                  authors: currentVersion.people
                    .filter((p) => p.role === 'AUTHOR')
                    .map((p) => p.person),
                  artists: currentVersion.people
                    .filter((p) => p.role === 'ARTIST')
                    .map((p) => p.person),
                  teams: publishers.map((t) => t.team),
                }
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при отриманні даних')
              }
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
            },
          )
          .get(
            '/preview',
            async ({ params: { id }, status, user }) => {
              try {
                const [previewData, userFolders] = await Promise.all([
                  prisma.title.findUnique({
                    where: { id, currentVersion: { isNot: null } },
                    select: {
                      id: true,
                      currentVersion: {
                        select: {
                          description: true,
                          ageRestriction: true,
                          releaseYear: true,
                          nameUkr: true,
                          nameEng: true,
                          translationStatus: true,
                          titleStatus: true,
                          genres: {
                            select: {
                              genre: { select: { id: true, name: true } },
                            },
                          },
                          tags: {
                            select: {
                              tag: { select: { id: true, name: true } },
                            },
                          },
                        },
                      },
                      publishers: {
                        take: 1,
                        orderBy: {
                          chapters: {
                            _count: 'desc',
                          },
                        },
                        select: {
                          _count: {
                            select: {
                              chapters: {
                                where: {
                                  approvalStatus:
                                    ChapterApprovalStatus.APPROVED,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  }),
                  user?.id
                    ? prisma.bookmarkFolder.findMany({
                        where: { userId: user.id },
                        orderBy: { sortOrder: 'asc' },
                        select: {
                          id: true,
                          name: true,
                          color: true,
                          isSystem: true,
                          systemType: true,
                          bookmarks: {
                            where: { titleId: id },
                            select: {
                              id: true,
                              lastChapterId: true,
                            },
                          },
                        },
                      })
                    : null,
                ])

                if (!previewData || !previewData.currentVersion) {
                  return status(404, 'Твір не знайдено')
                }

                assertNonNullable(previewData, ['currentVersion'])

                const chaptersCount = previewData.publishers.reduce(
                  (max, publisher) => Math.max(max, publisher._count.chapters),
                  0,
                )

                let activeFolder = null
                let bookmarkFolders = null

                if (userFolders) {
                  const parsedFolders = userFolders.map((folder) =>
                    bookmarkFolderSchema.parse(folder),
                  )

                  const activeFolderRaw = parsedFolders.find(
                    (folder) => folder.bookmarks.length > 0,
                  )

                  bookmarkFolders = parsedFolders.map(
                    ({ bookmarks, ...folder }) => folder,
                  )

                  if (activeFolderRaw) {
                    const { bookmarks, ...folder } = activeFolderRaw
                    activeFolder = folder
                  }
                }

                const { publishers, ...restData } = previewData

                return {
                  ...restData,
                  chaptersCount,
                  bookmarkFolders,
                  activeFolder,
                }
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при отриманні даних')
              }
            },
            {
              optionalAuth: true,
            },
          )
          .patch(
            '/revise',
            async ({ params: { id }, body, status, user }) => {
              try {
                // 1. Отримання твору та перевірка початкових умов
                const title = await prisma.title.findUnique({
                  where: {
                    id,
                    approvalStatus: 'REJECTED',
                    currentVersion: { isNot: null },
                  },
                  select: {
                    id: true,
                    proposedByUserId: true,
                    approvalStatus: true,
                    currentVersion: {
                      select: { coverUrl: true, backgroundUrl: true },
                    },
                  },
                })

                if (!title || !title.currentVersion)
                  return status(404, 'Цього твору не існує')

                assertNonNullable(title, ['currentVersion'])

                if (title.proposedByUserId !== user.id) {
                  return status(
                    403,
                    'У вас немає прав для редагування цього твору',
                  )
                }

                // 2. Перевірка членства користувача в усіх вказаних командах
                const teamIds = body.teams.map((t) => t.id)

                const memberships = await prisma.teamMember.findMany({
                  where: {
                    userId: user.id,
                    teamId: { in: teamIds },
                  },
                  select: { teamId: true },
                })

                const joinedTeamIds = new Set(memberships.map((m) => m.teamId))
                const notMemberOf = teamIds.filter(
                  (id) => !joinedTeamIds.has(id),
                )

                if (notMemberOf.length > 0) {
                  return status(403, 'Ви не є членом усіх зазначених команд')
                }

                // 3. Форматування альтернативних назв
                const alternativeNames = body.alternativeNames
                  ? body.alternativeNames
                      .split(' / ')
                      .map((name) => name.trim())
                      .filter(Boolean)
                  : []

                const titleFolder = `uploads/titles/${slugify(body.enName)}--${title.id}`

                // 4. Обробка обкладинки в S3
                let finalCoverKey = title.currentVersion.coverUrl

                if (body.coverKey && body.coverKey.includes('/temp/')) {
                  const coverFileName = body.coverKey.split('/').pop()
                  finalCoverKey = `${titleFolder}/cover/${coverFileName}`

                  const isCoverMoved = await moveS3File(
                    body.coverKey,
                    finalCoverKey,
                  )

                  if (!isCoverMoved) {
                    return status(500, 'Не вдалося зберегти нову обкладинку')
                  }

                  if (title.currentVersion.coverUrl) {
                    try {
                      await S3.send(
                        new DeleteObjectCommand({
                          Bucket: process.env.S3_BUCKET_NAME,
                          Key: title.currentVersion.coverUrl,
                        }),
                      )
                    } catch (s3Error) {
                      console.error(
                        'Помилка видалення старої обкладинки з S3:',
                        s3Error,
                      )
                    }
                  }
                } else if (!body.coverKey) {
                  finalCoverKey = null

                  if (title.currentVersion.coverUrl) {
                    try {
                      await S3.send(
                        new DeleteObjectCommand({
                          Bucket: process.env.S3_BUCKET_NAME,
                          Key: title.currentVersion.coverUrl,
                        }),
                      )
                    } catch (s3Error) {
                      console.error(
                        'Помилка видалення старої обкладинки з S3:',
                        s3Error,
                      )
                    }
                  }
                }

                // 5. Обробка фонового зображення в S3
                let finalBGKey = title.currentVersion.backgroundUrl

                if (
                  body.backgroundKey &&
                  body.backgroundKey.includes('/temp/')
                ) {
                  const bgFileName = body.backgroundKey.split('/').pop()
                  finalBGKey = `${titleFolder}/background/${bgFileName}`

                  const isBGMoved = await moveS3File(
                    body.backgroundKey,
                    finalBGKey,
                  )

                  if (!isBGMoved) {
                    return status(
                      500,
                      'Не вдалося зберегти нове фонове зображення',
                    )
                  }

                  if (title.currentVersion.backgroundUrl) {
                    try {
                      await S3.send(
                        new DeleteObjectCommand({
                          Bucket: process.env.S3_BUCKET_NAME,
                          Key: title.currentVersion.backgroundUrl,
                        }),
                      )
                    } catch (s3Error) {
                      console.error(
                        'Помилка видалення старого фонового зображення з S3:',
                        s3Error,
                      )
                    }
                  }
                } else if (!body.backgroundKey) {
                  finalBGKey = null

                  if (title.currentVersion.backgroundUrl) {
                    try {
                      await S3.send(
                        new DeleteObjectCommand({
                          Bucket: process.env.S3_BUCKET_NAME,
                          Key: title.currentVersion.backgroundUrl,
                        }),
                      )
                    } catch (s3Error) {
                      console.error(
                        'Помилка видалення фонового зображення з S3:',
                        s3Error,
                      )
                    }
                  }
                }

                // 6. Оновлення записів у базі даних
                await prisma.title.update({
                  where: { id },
                  data: {
                    approvalStatus: 'PENDING',
                    moderationFeedback: null,
                    lockedFields: [] as TitleFieldName[],
                    publishers: {
                      deleteMany: {},
                      create: body.teams.map((team) => ({
                        team: { connect: { id: team.id } },
                      })),
                    },
                    currentVersion: {
                      update: {
                        coverUrl: finalCoverKey,
                        backgroundUrl: finalBGKey,
                        nameUkr: body.ukrName,
                        nameEng: body.enName,
                        description: body.description || null,
                        type: body.type,
                        titleStatus: body.titleStatus,
                        translationStatus: body.translationStatus,
                        ageRestriction: body.ageRestriction,
                        releaseYear: parseInt(body.releaseYear),
                        alternativeNames: {
                          deleteMany: {},
                          create: alternativeNames.map((name) => ({ name })),
                        },
                        genres: {
                          deleteMany: {},
                          create: body.genres.map((g) => ({
                            genreId: g.id,
                          })),
                        },
                        tags: {
                          deleteMany: {},
                          create: body.tags.map((t) => ({
                            tagId: t.id,
                          })),
                        },
                        people: {
                          deleteMany: {},
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
                        sources: {
                          deleteMany: {},
                          create: body.sources.map((s) => ({
                            url: s.url,
                          })),
                        },
                      },
                    },
                  },
                })

                // 7. Повідомляємо про успішно виконаний запит
                return {
                  message: 'Запит відправлено',
                  userId: user.id,
                }
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при зміні даних')
              }
            },
            {
              authed: true,
              body: sendNewTitleDataSchema,
            },
          )
          .delete(
            '/',
            async ({ params: { id }, status, user }) => {
              try {
                const title = await prisma.title.findUnique({
                  where: { id, currentVersion: { isNot: null } },
                  select: {
                    proposedByUserId: true,
                    approvalStatus: true,
                    currentVersion: {
                      select: { coverUrl: true, backgroundUrl: true },
                    },
                  },
                })

                if (!title || !title.currentVersion)
                  return status(404, 'Цього твору не існує')

                assertNonNullable(title, ['currentVersion'])

                if (
                  title.proposedByUserId !== user.id ||
                  title.approvalStatus !== 'REJECTED'
                ) {
                  return status(
                    403,
                    'У вас немає прав для видалення цього запиту',
                  )
                }

                await prisma.title.delete({
                  where: {
                    id,
                    approvalStatus: 'REJECTED',
                    proposedByUserId: user.id,
                  },
                })

                try {
                  const rawKeys = [
                    title.currentVersion.coverUrl,
                    title.currentVersion.backgroundUrl,
                  ]
                  const validKeys = rawKeys.filter(
                    (key): key is string =>
                      typeof key === 'string' && key.trim() !== '',
                  )

                  if (validKeys.length > 0) {
                    const objectsPayload = validKeys.map((key) => ({
                      Key: key,
                    }))

                    const command = new DeleteObjectsCommand({
                      Bucket: process.env.S3_BUCKET_NAME,
                      Delete: {
                        Objects: objectsPayload,
                        Quiet: true,
                      },
                    })

                    await S3.send(command)
                  }
                } catch (s3Error) {
                  console.error('Помилка при видаленні файлів з S3: ', s3Error)
                }

                return { message: 'Запит виконано', userId: user.id }
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при роботі з БД')
              }
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
            },
          )
      })
  })
