import { S3 } from '@/lib/s3-client'
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3'
import { cron } from '@elysiajs/cron'
import { Elysia } from 'elysia'

const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 24 години
// const ONE_DAY_MS = 0 // для тесту

export const cronJobsPlugin = new Elysia({ name: 'cron-jobs' }).use(
  cron({
    name: 'cleanup-temp-files',
    pattern: '0 3 * * *', // О 3:00 щоночі
    // pattern: '*/1 * * * *', // Для тесту
    timezone: 'Europe/Kyiv',
    async run() {
      console.log('🧹 Запуск cron: Очищення старих тимчасових файлів...')
      const now = Date.now()

      let isTruncated = true
      // Токен для пагінації (якщо файлів більше 1000, S3 віддає їх сторінками)
      let continuationToken: string | undefined = undefined

      try {
        while (isTruncated) {
          // 1. Отримуємо список файлів у папці temp/
          const input: ListObjectsV2CommandInput = {
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: 'uploads/temp/',
            ContinuationToken: continuationToken,
          }
          const listCommand = new ListObjectsV2Command(input)

          const listResponse: ListObjectsV2CommandOutput =
            await S3.send(listCommand)

          // Якщо тека пуста — завершуємо роботу
          if (!listResponse.Contents || listResponse.Contents.length === 0) {
            console.log('Немає що видаляти.')
            break
          }

          // 2. Фільтруємо файли, які старіші за 24 години
          const objectsToDelete = listResponse.Contents.filter((item) => {
            if (!item.LastModified) return false
            const fileAge = now - item.LastModified.getTime()
            return fileAge > ONE_DAY_MS
          }).map((item) => ({ Key: item.Key }))

          // 3. Видаляємо старі файли
          if (objectsToDelete.length > 0) {
            const deleteCommand = new DeleteObjectsCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Delete: {
                Objects: objectsToDelete,
                Quiet: true,
              },
            })

            await S3.send(deleteCommand)
            console.log(
              `✅ Видалено ${objectsToDelete.length} застарілих файлів.`,
            )
          }

          // Перевіряємо, чи є ще наступна "сторінка" файлів
          isTruncated = listResponse.IsTruncated ?? false
          continuationToken = listResponse.NextContinuationToken
        }
      } catch (error) {
        console.error('❌ Помилка під час виконання cron очищення:', error)
      }
    },
  }),
)
