import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import z from 'zod'
import { TeamStatus, TitleApprovalStatus } from '@/generated/prisma/enums'
import {
  changeUserProfileSchema,
  changeUserSecuritySchema,
  userTeamsRequestsSchema,
  userTitlesRequestsSchema,
} from '@/schemas/users'
import { moveS3File } from '@/lib/utils'
import { S3 } from '@/lib/s3-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/lib/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { isAPIError } from 'better-auth/api'
import { Prisma } from '@/generated/prisma/client'
import Bowser from 'bowser'

const TEAM_STATUS_MAP = {
  pending: TeamStatus.PENDING,
  approved: TeamStatus.APPROVED,
  rejected: TeamStatus.REJECTED,
} as const

const TITLE_STATUS_MAP = {
  pending: TitleApprovalStatus.PENDING,
  approved: TitleApprovalStatus.APPROVED,
  rejected: TitleApprovalStatus.REJECTED,
} as const

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

          const TWO_MINUTES = 2 * 60 * 1000

          const isOnline = userData.lastSeenAt
            ? Date.now() - userData.lastSeenAt.getTime() < TWO_MINUTES
            : false

          if (isMe) {
            return {
              isOnline,
              isMe: true as const,
              user: userData,
            }
          }

          const { email, emailVerified, ...publicUserData } = userData

          return {
            isOnline,
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
      .post(
        '/ping',
        async ({ user, session, status }) => {
          const now = new Date()
          try {
            await Promise.all([
              prisma.user.update({
                where: { id: user.id },
                data: { lastSeenAt: now },
              }),
              prisma.session.update({
                where: { id: session.id },
                data: { lastSeenAt: now },
              }),
            ])

            return status(200, 'Статус перебування на сайті оновлено')
          } catch (error) {
            console.log(`Помилка оновлення lastSeenAt: ${error}`)
            return status(500, 'Помилка оновлення статусу')
          }
        },
        { authed: true },
      )
      .group('/user/:id/settings', (app) => {
        return app
          .get(
            '/profile',
            async ({ user, status, params: { id } }) => {
              const isMe = id === user.id

              if (!isMe) return status(403, 'Доступ обмежено')

              const userProfileData = await prisma.user.findUnique({
                where: { id },
                select: {
                  id: true,
                  displayUsername: true,
                  description: true,
                  image: true,
                  backgroundUrl: true,
                },
              })

              if (!userProfileData)
                return status(404, 'Користувача не знайдено')

              return userProfileData
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
            },
          )
          .patch(
            '/profile',
            async ({ user, status, body, params: { id } }) => {
              const isMe = id === user.id

              if (!isMe) return status(403, 'Доступ обмежено')

              // Дістаємо старі зображення
              const currentUser = await prisma.user.findUnique({
                where: { id },
                select: {
                  username: true,
                  image: true,
                  backgroundUrl: true,
                },
              })

              if (!currentUser) return status(404, 'Користувача не знайдено')

              // Пеервірка на доступність псевдоніму, якщо його змінюють
              if (body.username.toLowerCase() !== currentUser.username) {
                const response = await auth.api.isUsernameAvailable({
                  body: {
                    username: body.username,
                  },
                })

                if (!response.available) {
                  return status(409, 'Цей псевдонім вже зайнято')
                }
              }

              const userFolder = `uploads/users/${body.username}-${id}`

              // --- ЛОГІКА ДЛЯ АВАТАРКИ ---
              let finalAvatarKey = currentUser.image

              if (body.avatarKey && body.avatarKey.includes('/temp/')) {
                // Випадок А: Прийшов новий тимчасовий ключ -> переносимо його і видаляємо старий
                const avatarFileName = body.avatarKey.split('/').pop()
                finalAvatarKey = `${userFolder}/avatar/${avatarFileName}`

                const isAvatarMoved = await moveS3File(
                  body.avatarKey,
                  finalAvatarKey,
                )
                if (!isAvatarMoved) {
                  return status(500, 'Не вдалося зберегти новий аватар')
                }

                // Якщо у користувача вже була аватарка, видаляємо її з S3
                if (currentUser.image) {
                  try {
                    await S3.send(
                      new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: currentUser.image,
                      }),
                    )
                  } catch (s3Error) {
                    console.error(
                      'Помилка видалення старої аватарки з S3:',
                      s3Error,
                    )
                  }
                }
              } else if (body.avatarKey === '') {
                // Випадок Б: Користувач натиснув "видалити" і поле прийшло порожнім
                finalAvatarKey = null

                if (currentUser.image) {
                  try {
                    await S3.send(
                      new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: currentUser.image,
                      }),
                    )
                  } catch (s3Error) {
                    console.error(
                      'Помилка видалення аватару користувача з S3:',
                      s3Error,
                    )
                  }
                }
              }

              // --- ЛОГІКА ДЛЯ ФОНОВОГО ЗОБРАЖЕННЯ ---
              let finalBackgroundKey = currentUser.backgroundUrl

              if (body.backgroundKey && body.backgroundKey.includes('/temp/')) {
                // Випадок А: Нове фонове зображення
                const bgFileName = body.backgroundKey.split('/').pop()
                finalBackgroundKey = `${userFolder}/background/${bgFileName}`

                const isBgMoved = await moveS3File(
                  body.backgroundKey,
                  finalBackgroundKey,
                )
                if (!isBgMoved) {
                  return status(
                    500,
                    'Не вдалося зберегти нове фонове зображення',
                  )
                }

                if (currentUser.backgroundUrl) {
                  try {
                    await S3.send(
                      new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: currentUser.backgroundUrl,
                      }),
                    )
                  } catch (s3Error) {
                    console.error(
                      'Помилка видалення старого фону з S3:',
                      s3Error,
                    )
                  }
                }
              } else if (body.backgroundKey === '') {
                // Випадок Б: Фонове зображення видалено
                finalBackgroundKey = null

                if (currentUser.backgroundUrl) {
                  try {
                    await S3.send(
                      new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: currentUser.backgroundUrl,
                      }),
                    )
                  } catch (s3Error) {
                    console.error(
                      'Помилка видалення фонового зображення користувача з S3:',
                      s3Error,
                    )
                  }
                }
              }

              // Записуємо оновлені дані в БД
              try {
                await prisma.user.update({
                  where: { id },
                  data: {
                    name: body.username.toLowerCase(),
                    username: body.username.toLowerCase(),
                    displayUsername: body.username,
                    description: body.description,
                    image: finalAvatarKey,
                    backgroundUrl: finalBackgroundKey,
                  },
                })

                return {
                  message: 'Дані профілю оновлено',
                }
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при збереженні даних')
              }
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
              body: changeUserProfileSchema,
            },
          )
          .get(
            '/security',
            async ({ user, status, params: { id } }) => {
              const isMe = id === user.id

              if (!isMe) return status(403, 'Доступ обмежено')

              const userSecurityData = await prisma.user.findUnique({
                where: { id },
                select: {
                  id: true,
                  email: true,
                  emailVerified: true,
                },
              })

              if (!userSecurityData)
                return status(404, 'Користувача не знайдено')

              return userSecurityData
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
            },
          )
          .patch(
            '/security',
            async ({ user, status, body, params: { id } }) => {
              const isMe = id === user.id

              if (!isMe) return status(403, 'Доступ обмежено')

              const currentUser = await prisma.user.findUnique({
                where: { id },
                select: {
                  email: true,
                },
              })

              if (!currentUser) return status(404, 'Користувача не знайдено')

              const headers = await getRequestHeaders()

              try {
                if (body.currentPassword && body.newPassword) {
                  await auth.api.changePassword({
                    body: {
                      currentPassword: body.currentPassword,
                      newPassword: body.newPassword,
                      revokeOtherSessions: false,
                    },
                    headers,
                  })
                }

                if (body.email !== currentUser.email) {
                  await auth.api.changeEmail({
                    body: {
                      newEmail: body.email,
                      callbackURL: '/email-change-accepted',
                    },
                    headers,
                  })
                }

                return status(200, 'Дані оновлено')
              } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                  if (error.code === 'P2002') {
                    return status(
                      409,
                      'Користувач із такою електронною поштою вже існує',
                    )
                  }
                }

                if (isAPIError(error)) {
                  console.log(error)
                  if (error.body?.code === 'INVALID_PASSWORD') {
                    return status(500, 'Неправильний поточний пароль')
                  }
                  return status(500, error.message)
                } else {
                  return status(500, 'Не вдалося оновити дані')
                }
              }
            },
            {
              authed: true,
              params: z.object({
                id: z.string(),
              }),
              body: changeUserSecuritySchema,
            },
          )
          .get(
            '/devices',
            async ({ status, session: currentSession }) => {
              try {
                const sessions = await auth.api.listSessions({
                  headers: getRequestHeaders(),
                })

                const formattedDevices = await Promise.all(
                  sessions.map(async (session) => {
                    const parser = Bowser.getParser(
                      session.userAgent || 'Невідомо',
                    )

                    const browser = parser.getBrowser()
                    const os = parser.getOS()
                    const platform = parser.getPlatform()

                    const browserName = browser.name || 'Невідомий браузер'
                    const browserVersion = browser.version
                      ? browser.version.split('.')[0]
                      : ''
                    const osName = os.name || 'Невідома ОС'

                    let deviceName = 'Настільний ПК'
                    if (platform.model) {
                      deviceName =
                        `${platform.vendor || ''} ${platform.model}`.trim()
                    } else if (platform.type === 'mobile') {
                      deviceName = 'Мобільний пристрій'
                    } else if (platform.type === 'tablet') {
                      deviceName = 'Планшет'
                    }

                    let location = 'Невідома локація'
                    const ip = session.ipAddress

                    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
                      try {
                        const geoGes = await fetch(
                          `http://ip-api.com/json/${ip}`,
                        )
                        const geoData = await geoGes.json()
                        if (geoData.status === 'success') {
                          location = `${geoData.city}, ${geoData.country}`
                        }
                      } catch (error) {
                        console.error('Помилка геолокації', error)
                      }
                    } else {
                      location = 'Localhost'
                    }

                    return {
                      id: session.id,
                      token: session.token,
                      createdAt: session.createdAt,
                      lastSeenAt: session.lastSeenAt,
                      isCurrent: session.id === currentSession.id,
                      browser: `${browserName} ${browserVersion}`.trim(),
                      os: osName,
                      device: deviceName,
                      location,
                    }
                  }),
                )

                return formattedDevices
              } catch (error) {
                console.error('Помилка під час отримання списку всіх сеансів')
                return status(500, 'Не вдалося отримати список всіх сеансів')
              }
            },
            {
              authed: true,
            },
          )
      })
      .group('/user/:id/requests', (app) => {
        return app
          .get(
            '/teams',
            async ({ query, params: { id }, user, status }) => {
              try {
                const isMe = id === user.id

                if (!isMe) return status(403, 'Доступ обмежено')

                const teamsRequestsData = await prisma.team.findMany({
                  where: {
                    creatorId: id,
                    status: TEAM_STATUS_MAP[query.status],
                  },
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    coverUrl: true,
                  },
                })

                return teamsRequestsData
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при завантаженні даних')
              }
            },
            {
              query: userTeamsRequestsSchema,
              authed: true,
            },
          )
          .get(
            '/titles',
            async ({ query, params: { id }, user, status }) => {
              try {
                const isMe = id === user.id

                if (!isMe) return status(403, 'Доступ обмежено')

                const rawTitles = await prisma.title.findMany({
                  where: {
                    proposedByUserId: id,
                    approvalStatus: TITLE_STATUS_MAP[query.status],
                    currentVersion: { isNot: null },
                  },
                  select: {
                    id: true,
                    approvalStatus: true,
                    currentVersion: {
                      select: {
                        nameUkr: true,
                        coverUrl: true,
                      },
                    },
                  },
                })

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

                const formattedTitles = titles.map((title) => ({
                  id: title.id,
                  status: title.approvalStatus,
                  name: title.currentVersion.nameUkr,
                  coverUrl: title.currentVersion.coverUrl,
                }))

                return formattedTitles
              } catch (dbError) {
                console.error('Помилка БД: ', dbError)
                return status(500, 'Помилка при завантаженні даних')
              }
            },
            {
              query: userTitlesRequestsSchema,
              authed: true,
            },
          )
      })
  })
