import { Elysia } from 'elysia'
import { betterAuthPlugin } from '../plugins/auth'
import { prisma } from '@/db'
import { createId } from '@paralleldrive/cuid2'
import z from 'zod'
import { createPersonSchema } from '@/schemas/people'
import { moveS3File } from '@/lib/utils'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { S3 } from '@/lib/s3-client'

async function getPersonOrFail(id: string) {
  const person = await prisma.person.findUnique({ where: { id } })

  if (!person) return 'NOT_FOUND' as const
  if (person.verificationStatus !== 'PENDING') return 'NOT_PENDING' as const

  return person
}

export const peopleRouter = new Elysia({
  name: 'people-router',
  tags: ['People'],
})
  .use(betterAuthPlugin)
  .group('/people', (app) => {
    return app
      .post(
        '/create-person',
        async ({ body, status, user }) => {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { proposedPeople: true },
          })

          if (!dbUser) return status(404, 'Користувача не знайдено')
          if (dbUser.status === 'BANNED' || dbUser.status === 'RESTRICTED')
            return status(
              403,
              'Обмежені в доступі користувачі не можуть виконати цю дію',
            )

          let pendingCount = 0

          for (const person of dbUser.proposedPeople) {
            if (person.verificationStatus === 'PENDING') {
              pendingCount++
            }
            if (pendingCount >= 3) break
          }

          if (pendingCount >= 3)
            return status(
              403,
              'У вас вже є запити на перевірці. Дочекайтеся їх результатів',
            )

          const personId = createId()
          const personFolder = `uploads/people/${body.nameLat}-${personId}`

          let newCoverKey = null
          if (body.coverKey) {
            const coverFileName = body.coverKey.split('/').pop()
            newCoverKey = `${personFolder}/cover/${coverFileName}`

            const isBgMoved = await moveS3File(body.coverKey, newCoverKey)
            if (!isBgMoved) {
              return status(500, 'Не вдалося зберегти обкладинку')
            }
          }

          try {
            await prisma.person.create({
              data: {
                id: personId,
                nameUkr: body.nameUkr,
                nameLat: body.nameLat,
                description:
                  body.description === undefined ? null : body.description,
                coverUrl: newCoverKey,
                verificationStatus: 'PENDING',
                proposedByUserId: user.id,
              },
            })

            return {
              message: 'Запит на додавання персони відправлено',
            }
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }
        },
        {
          authed: true,
          body: createPersonSchema,
        },
      )
      .get(
        '/people-to-attach',
        async ({ query, status }) => {
          try {
            const { search } = query

            if (!search || search.trim() === '') {
              return []
            }

            const people = await prisma.person.findMany({
              where: {
                verificationStatus: 'APPROVED',
                OR: [
                  {
                    nameUkr: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    nameLat: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
              take: 20,
              select: {
                id: true,
                nameUkr: true,
                nameLat: true,
              },
            })

            return people
          } catch (error) {
            console.error('Помилка при пошуку персон: ', error)
            return status(500, 'Помилка при пошуку персон')
          }
        },
        {
          query: z.object({
            search: z.string(),
          }),
        },
      )
      .get(
        '/get-pending-people',
        async ({ query, status }) => {
          try {
            const page = query.page ?? 1
            const limit = 10
            const skip = (page - 1) * limit

            const [people, total] = await Promise.all([
              prisma.person.findMany({
                where: { verificationStatus: 'PENDING' },
                include: {
                  proposedByUser: { select: { displayUsername: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
              }),
              prisma.person.count({
                where: { verificationStatus: 'PENDING' },
              }),
            ])

            return {
              people,
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
        '/person-adding-request/:id',
        async ({ params: { id }, status }) => {
          const personData = await prisma.person.findFirst({
            where: {
              AND: { id, verificationStatus: 'PENDING' },
            },
            include: {
              proposedByUser: {
                select: { image: true, displayUsername: true },
              },
            },
          })
          if (!personData) {
            return status(404, 'Такої заявки не знайдено')
          }
          return personData
        },
        {
          moderator: true,
          params: z.object({
            id: z.string(),
          }),
        },
      )
      .patch(
        '/approve-person-request',
        async ({ status, body }) => {
          try {
            const person = await getPersonOrFail(body.id)
            if (person === 'NOT_FOUND')
              return status(404, 'Персону не знайдено')
            if (person === 'NOT_PENDING')
              return status(409, 'Запит вже оброблено')

            await prisma.person.update({
              where: { id: body.id },
              data: { verificationStatus: 'APPROVED' },
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
      .delete(
        '/decline-person-request',
        async ({ status, body }) => {
          const person = await getPersonOrFail(body.id)
          if (person === 'NOT_FOUND') return status(404, 'Персону не знайдено')
          if (person === 'NOT_PENDING')
            return status(409, 'Запит вже оброблено')

          try {
            await prisma.person.delete({
              where: { id: body.id },
            })
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при збереженні даних')
          }

          try {
            if (body.coverUrl !== null && body.coverUrl.trim() !== '') {
              const command = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: body.coverUrl,
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
          }),
        },
      )
  })
