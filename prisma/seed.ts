import { prisma } from '@/db'
import { GENRES, TAGS } from '@/lib/constants'

async function main() {
  console.log(`Start seeding...`)

  for (const g of GENRES) {
    await prisma.genre.upsert({
      where: { name: g.name },
      update: {},
      create: g,
    })
  }

  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    })
  }

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
