import { S3 } from '@/lib/s3-client'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { betterAuthPlugin } from '../plugins/auth'

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
})

export type RequestSchemaTypes = z.infer<typeof uploadRequestSchema>

export const filesRouter = new Elysia({
  name: 'files-router',
  tags: ['Files'],
})
  .use(betterAuthPlugin)
  .group('/files', (app) => {
    return app
      .onError(({ code, status }) => {
        if (code === 'VALIDATION')
          return status('Bad Request', 'Файл не валідний')
      })
      .group('/temp', (app) => {
        return app
          .post(
            '/upload',
            async ({ body, user }) => {
              const { contentType, fileName, size } = body

              const uniqueKey = `uploads/temp/${user.id}/${createId()}-${fileName.replace(/\s+/g, '_')}`

              const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
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
            },
            {
              body: uploadRequestSchema,
              authed: true,
            },
          )
          .delete(
            '/:key',
            async ({ params, user, status }) => {
              const key = decodeURIComponent(params.key)

              console.log('Ключ ', key)

              if (!key.includes(`/${user.id}/`)) {
                return status(
                  403,
                  'У вас немає прав на пряме видалення цього файлу',
                )
              }

              const command = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
              })

              await S3.send(command)

              return { message: 'Зображення видалено' }
            },
            {
              authed: true,
            },
          )
      })
  })
