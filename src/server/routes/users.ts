import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import z from 'zod'
import { TeamStatus } from '@/generated/prisma/enums'
import { changeUserProfileSchema } from '@/schemas/users'
import { moveS3File } from '@/lib/utils'
import { S3 } from '@/lib/s3-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/lib/auth'

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
      })
  })
