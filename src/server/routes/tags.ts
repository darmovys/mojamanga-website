import { Elysia } from 'elysia'
import { prisma } from '@/db'

export const tagsRouter = new Elysia({
  name: 'tags-router',
  tags: ['Tags'],
}).group('/tags', (app) => {
  return app.get('/all', async ({ status }) => {
    try {
      const tags = await prisma.tag.findMany({
        select: {
          id: true,
          name: true,
        },
      })

      return tags
    } catch (error) {
      console.error('Помилка при отриманні тегів: ', error)
      return status(500, 'Помилка при отриманні тегів')
    }
  })
})
