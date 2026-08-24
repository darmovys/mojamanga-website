import { S3 } from '@/lib/s3-client'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { Elysia, fileType } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import { z } from 'zod'
import { betterAuthPlugin } from '../plugins/auth'
import sharp from 'sharp'
import { extractAccentColor } from '@/lib/extract-accent-color.server'
import { RateLimitError } from '@/lib/rate-limit'

const uploadRateLimit = rateLimit({
  duration: 60 * 1000,
  max: 30,
  errorResponse: new RateLimitError(
    'Забагато запитів на заванатження зображення. Спробуйте пізніше.',
  ),
  scoping: 'scoped',
})

const gifProcessingRateLimit = rateLimit({
  duration: 60 * 1000,
  max: 10,
  errorResponse: new RateLimitError(
    'Перевищено ліміт обробки GIF. Зачекайте декілька хвилин.',
  ),
  scoping: 'scoped',
})

const colorExtractionRateLimit = rateLimit({
  duration: 60 * 1000,
  max: 20,
  errorResponse: new RateLimitError(
    'Забагато запитів на аналіз кольору. Зачекайте декілька хвилин.',
  ),
  scoping: 'scoped',
})

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
})

const fileSizeLimit = 5 * 1024 * 1024 // 5 МБ

const gifSchema = z.object({
  x: z.coerce.number({ error: 'Значення x не є числом' }),
  y: z.coerce.number({ error: 'Значення y не є числом' }),
  width: z.coerce.number({ error: 'Значення width не є числом' }),
  height: z.coerce.number({ error: 'Значення height не є числом' }),
  originalFile: z
    .file()
    .refine((file) => fileType(file, 'image/gif'), {
      error: 'Файл не відповідає типу GIF',
    })
    .refine((file) => file.size <= fileSizeLimit, {
      error: 'Файл не має перевищувати розмір в 5 МБ',
    }),
})

const imageToExtractColorSchema = z.object({
  file: z
    .file()
    .refine((file) => fileType(file, 'image/*'), {
      error: 'Не підтримуваний формат файлу',
    })
    .refine((file) => file.size <= fileSizeLimit, {
      error: 'Файл не має перевищувати розмір в 5 МБ',
    }),
})

export type RequestSchemaTypes = z.infer<typeof uploadRequestSchema>

export const filesRouter = new Elysia({
  name: 'files-router',
  tags: ['Files'],
})
  .use(betterAuthPlugin)
  .error({
    RATE_LIMIT: RateLimitError,
  })
  .onError(({ code, error, status }) => {
    if (code === 'RATE_LIMIT') {
      return status(429, error.message)
    }
  })
  .group('/files', (app) => {
    return app
      .group('/temp', (tempGroup) => {
        return tempGroup
          .onError(({ code, status }) => {
            if (code === 'VALIDATION')
              return status('Bad Request', 'Файл не валідний')
          })
          .group('', (uploadGroup) => {
            return uploadGroup.use(uploadRateLimit).post(
              '/upload',
              async ({ body, status, user }) => {
                const { contentType, fileName, size } = body

                const uniqueKey = `uploads/temp/${user.id}/${createId()}-${fileName.replace(/\s+/g, '_')}`

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
                  return status(
                    500,
                    'Помилка при спробі завантажити зображення',
                  )
                }
              },
              {
                body: uploadRequestSchema,
                authed: true,
              },
            )
          })
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
      .group('', (gifGroup) => {
        return gifGroup.use(gifProcessingRateLimit).post(
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
          { body: gifSchema, authed: true },
        )
      })

      .onError(({ code, status, error }) => {
        if (code === 'VALIDATION')
          return status(422, error.messageValue?.message)
      })
      .group('', (colorGroup) => {
        return colorGroup.use(colorExtractionRateLimit).post(
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
          },
        )
      })
  })
