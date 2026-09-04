import { S3 } from '@/lib/s3-client'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { betterAuthPlugin } from '../plugins/auth'
import sharp from 'sharp'
import { extractAccentColor } from '@/lib/extract-accent-color.server'
import {
  uploadRequestSchema,
  gifSchema,
  imageToExtractColorSchema,
} from '@/schemas/files'
import { rateLimitPlugin } from '../plugins/rate-limit'

export const filesRouter = new Elysia({
  name: 'files-router',
  tags: ['Files'],
})
  .use(betterAuthPlugin)
  .use(rateLimitPlugin)
  .group('/files', (app) => {
    return app
      .group('/temp', (tempGroup) => {
        return tempGroup
          .onError(({ code, status }) => {
            if (code === 'VALIDATION')
              return status('Bad Request', 'Файл не валідний')
          })
          .post(
            '/upload',
            async ({ body, status, user }) => {
              const { contentType, size } = body

              const type =
                contentType === 'image/gif'
                  ? '.gif'
                  : contentType === 'image/webp'
                    ? '.webp'
                    : ''

              const uniqueKey = `uploads/temp/${user.id}/${createId()}${type}`

              try {
                const command = new PutObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: uniqueKey,
                  ContentType: contentType,
                  ContentLength: size,
                })

                const presignedUrl = await getSignedUrl(S3, command, {
                  expiresIn: 360,
                })

                const response = {
                  presignedUrl,
                  key: uniqueKey,
                }

                return { response }
              } catch (error) {
                console.error('Помилка сервера: ', error)
                return status(500, 'Помилка при спробі завантажити зображення')
              }
            },
            {
              body: uploadRequestSchema,
              userRateLimit: {
                points: 30,
                duration: 60,
                message:
                  'Забагато запитів на заванатження зображення. Спробуйте пізніше.',
              },
            },
          )
          .delete(
            '/file',
            async ({ user, status, body }) => {
              const key = body.key

              if (!key.includes(`/${user.id}/`)) {
                return status(
                  403,
                  'У вас немає прав на пряме видалення цього файлу',
                )
              }

              try {
                const command = new DeleteObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: key,
                })

                await S3.send(command)
                return { message: 'Зображення видалено' }
              } catch (error) {
                console.error('Помилка сервера: ', error)
                return status(500, 'Помилка при спробі видалити зображення')
              }
            },
            {
              authed: true,
              body: z.object({
                key: z.string(),
              }),
            },
          )
      })
      .post(
        '/crop-gif',
        async ({ body, status, set }) => {
          try {
            const arrayBuffer = await body.originalFile.arrayBuffer()
            const inputBuffer = Buffer.from(arrayBuffer)

            const croppedBuffer = await sharp(inputBuffer, { animated: true })
              .extract({
                left: Math.round(body.x),
                top: Math.round(body.y),
                width: Math.round(body.width),
                height: Math.round(body.height),
              })
              .toBuffer()

            set.headers['Content-Type'] = 'application/octet-stream'
            set.headers['Cache-Control'] = 'no-cache'

            return croppedBuffer
          } catch (error) {
            console.error('Помилка під час обрізання GIF-файлу:', error)
            return status(500, 'Не вдалося обробити та обрізати GIF-файл')
          }
        },
        {
          body: gifSchema,
          userRateLimit: {
            duration: 60,
            points: 10,
            message: 'Перевищено ліміт обробки GIF. Зачекайте декілька хвилин.',
          },
        },
      )
      .onError(({ code, status, error }) => {
        if (code === 'VALIDATION')
          return status(422, error.messageValue?.message)
      })
      .post(
        '/extract-accent-color',
        async ({ body: { file }, set }) => {
          try {
            const buffer = Buffer.from(await file.arrayBuffer())
            const accentColor = await extractAccentColor(buffer)

            return { accentColor }
          } catch (error) {
            set.status = 422
            return { error: (error as Error).message }
          }
        },
        {
          body: imageToExtractColorSchema,
          ipRateLimit: {
            duration: 10,
            points: 60,
            message:
              'Забагато запитів на аналіз кольору. Зачекайте декілька хвилин.',
          },
        },
      )
  })
