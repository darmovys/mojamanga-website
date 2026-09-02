import { fileType } from 'elysia'
import { z } from 'zod'

const MB = 5
const FILE_SIZE_LIMIT = MB * 1024 * 1024 // 5 МБ
const ALLOWED_MIME_TYPES = ['image/webp', 'image/gif'] as const

export const uploadRequestSchema = z.object({
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    error: 'Дозволені лише зображення типу WebP та GIF',
  }),
  size: z
    .number()
    .min(1, { error: 'Файл не може бути порожнім' })
    .max(FILE_SIZE_LIMIT, {
      error: `Розмір файлу не повинен перевищувати ${MB} МБ`,
    }),
})

export const gifSchema = z.object({
  x: z.coerce.number({ error: 'Значення x не є числом' }),
  y: z.coerce.number({ error: 'Значення y не є числом' }),
  width: z.coerce.number({ error: 'Значення width не є числом' }),
  height: z.coerce.number({ error: 'Значення height не є числом' }),
  originalFile: z
    .file()
    .refine((file) => fileType(file, 'image/gif'), {
      error: 'Файл не відповідає типу GIF',
    })
    .refine((file) => file.size <= FILE_SIZE_LIMIT, {
      error: `Файл не має перевищувати розмір в ${MB} МБ`,
    }),
})

export const imageToExtractColorSchema = z.object({
  file: z
    .file()
    .refine((file) => fileType(file, 'image/*'), {
      error: 'Не підтримуваний формат файлу',
    })
    .refine((file) => file.size <= FILE_SIZE_LIMIT, {
      error: `Файл не має перевищувати розмір в ${MB} МБ`,
    }),
})
