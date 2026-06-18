import { prisma } from '@/db'

async function main() {
  console.log(`Start seeding...`)

  await prisma.person.createMany({
    data: [
      {
        nameUkr: 'Тест 1',
        nameLat: 'Test 1',
      },
      {
        nameUkr: 'Тест 2',
        nameLat: 'Test 2',
      },
      {
        nameUkr: 'Тест 3',
        nameLat: 'Test 3',
      },
      {
        nameUkr: 'Тест 4',
        nameLat: 'Test 4',
      },
      {
        nameUkr: 'Тест 5',
        nameLat: 'Test 5',
      },
      {
        nameUkr: 'Тест 6',
        nameLat: 'Test 6',
      },
      {
        nameUkr: 'Тест 7',
        nameLat: 'Test 7',
      },
      {
        nameUkr: 'Тест 8',
        nameLat: 'Test 8',
      },
      {
        nameUkr: 'Тест 9',
        nameLat: 'Test 9',
      },
      {
        nameUkr: 'Тест 10',
        nameLat: 'Test 10',
      },
      {
        nameUkr: 'Тест 11',
        nameLat: 'Test 11',
      },
      {
        nameUkr: 'Тест 12',
        nameLat: 'Test 12',
      },
      {
        nameUkr: 'Тест 13',
        nameLat: 'Test 13',
      },

      {
        nameUkr: 'Тест 14',
        nameLat: 'Test 14',
      },
      {
        nameUkr: 'Тест 15',
        nameLat: 'Test 15',
      },
    ],
  })

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
