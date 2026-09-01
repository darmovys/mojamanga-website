import { prisma } from '@/db'

interface AverageOptions {
  monthsWindow?: number // Кількість останніх місяців для аналізу (за замовчуванням 3)
}

/**
 * Рахує середню кількість розділів на місяць для команди
 * @param teamId - ідентифікатор команди
 * @param [options={}] - додаткові опції, такі як область часу для визначення (за промовчанням - 3 місяці)
 * @returns серендю кількість розділів на місяць, або null в разі помилки
 */
export async function getTeamMonthlyChapterAverage(
  teamId: string,
  options: AverageOptions = {},
): Promise<number | null> {
  try {
    const monthsWindow = options.monthsWindow ?? 3

    // Визначаємо початкову дату вікна (наприклад, 3 місяці тому)
    const windowStartDate = new Date()
    windowStartDate.setMonth(windowStartDate.getMonth() - monthsWindow)

    // Отримуємо команду для перевірки дати її створення
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { createdAt: true },
    })

    if (!team) {
      return null
    }

    // Рахуємо схвалені розділи цієї команди за вказаний період
    const chaptersCount = await prisma.chapter.count({
      where: {
        publishingVersion: {
          teamId: teamId,
        },
        approvalStatus: 'APPROVED',
        createdAt: {
          gte: windowStartDate,
        },
      },
    })

    // Якщо команда створена менше ніж N місяців тому, ділимо на реальний вік команди в місяцях
    const msInMonth = 1000 * 60 * 60 * 24 * 30.44
    const teamAgeInMonths = Math.max(
      1,
      (Date.now() - team.createdAt.getTime()) / msInMonth,
    )

    const effectiveMonths = Math.min(monthsWindow, teamAgeInMonths)
    const average = chaptersCount / effectiveMonths

    // Округлення до одного знака після коми (наприклад, 4.2)
    return Math.round(average * 10) / 10
  } catch (error) {
    console.error(
      `Помилка підрахунку середньої кількості розділів у місяць для команди ${teamId}:`,
      error,
    )
    return null
  }
}
