import { Elysia } from 'elysia'
import { prisma } from '@/db'
import { betterAuthPlugin } from '../plugins/auth'
import {
  addNewFolderSchema,
  deleteBookmarkSchema,
  upsertBookmarkSchema,
} from '@/schemas/bookmarks'
import { randomOklch } from '@/lib/utils'

export const bookmarksRouter = new Elysia({
  name: 'bookmarks-router',
  tags: ['Bookmarks'],
})
  .use(betterAuthPlugin)
  .group('/bookmarks', (app) => {
    return app
      .post(
        '/upsert',
        async ({ body: { titleId, folderId }, status, user }) => {
          try {
            const folder = await prisma.bookmarkFolder.findUnique({
              where: { id: folderId, userId: user.id },
              select: { id: true },
            })

            if (!folder) {
              return status(404, 'Папку закладок не знайдено')
            }

            const bookmark = await prisma.bookmark.upsert({
              where: { userId_titleId: { userId: user.id, titleId } },
              update: { folderId },
              create: { userId: user.id, titleId, folderId },
              select: { id: true, folderId: true, titleId: true },
            })

            return bookmark
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при додаванні закладки')
          }
        },
        {
          body: upsertBookmarkSchema,
          authed: true,
        },
      )
      .delete(
        '/',
        async ({ body, user, status }) => {
          try {
            const result = await prisma.bookmark.deleteMany({
              where: { titleId: body.titleId, userId: user.id },
            })

            if (result.count === 0) {
              return status(404, 'Закладки не знайдено')
            }

            return 'Закладку видалено'
          } catch (dbError) {
            console.error('Помилка БД: ', dbError)
            return status(500, 'Помилка при спробі видалити закладку')
          }
        },
        { authed: true, body: deleteBookmarkSchema },
      )
      .group('/custom-folder', (app) => {
        return app.post(
          '/',
          async ({ body, user, status }) => {
            try {
              const userData = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                  _count: {
                    select: {
                      bookmarksFolders: { where: { isSystem: false } },
                    },
                  },
                },
              })

              if (!userData) {
                return status(404, 'Користувача не знайдено')
              }

              if (userData._count.bookmarksFolders >= 10) {
                return status(403, 'Ви можете додати лише 10 власних папок')
              }

              const maxSortOrder = await prisma.bookmarkFolder.aggregate({
                where: {
                  userId: user.id,
                },
                _max: {
                  sortOrder: true,
                },
              })

              await prisma.bookmarkFolder.create({
                data: {
                  name: body.name,
                  userId: user.id,
                  sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
                  color: randomOklch(),
                },
              })

              return 'Папку створено'
            } catch (dbError) {
              console.error('Помилка БД: ', dbError)
              return status(500, 'Помилка при додаванні нової папки')
            }
          },
          {
            authed: true,
            body: addNewFolderSchema,
          },
        )
      })
  })
