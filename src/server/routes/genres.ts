import { Elysia } from 'elysia'
import { prisma } from '@/db'

export const genresRouter = new Elysia({
  name: 'genres-router',
  tags: ['Genres'],
}).group('/genres', (app) => {
  return app.get('/all', async ({ status }) => {
    try {
      const genres = await prisma.genre.findMany({
        select: {
          id: true,
          name: true,
        },
      })

      return genres
    } catch (error) {
      console.error('Помилка при отриманні жанрів: ', error)
      return status(500, 'Помилка при отриманні жанрів')
    }
  })
})
