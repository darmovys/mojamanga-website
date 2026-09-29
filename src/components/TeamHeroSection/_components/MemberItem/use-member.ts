import { useEffect, useRef, useState } from 'react'

// Інкрементальна функція розрахунку відступу
const getDynamicPaddingBottom = (linesCount: number) => {
  const BASE_PADDING_PX = 8 // 0.5rem — для 1 рядка
  const SECOND_LINE_PADDING_PX = 22 // 1.375rem — точка старту для 2 рядків
  const STEP_PER_LINE_PX = 16 // 1.0rem — приріст за кожен наступний рядок

  if (linesCount <= 1) {
    return BASE_PADDING_PX
  }

  // Розрахунок: 22px + 16px за кожен рядок понад два
  const calculatedPx =
    SECOND_LINE_PADDING_PX + (linesCount - 2) * STEP_PER_LINE_PX
  return calculatedPx
}

export function useMember() {
  const rolesRef = useRef<HTMLDivElement>(null)

  const LINE_HEIGHT_PX = 16.8

  // Початковий стан
  const [paddingBottom, setPaddingBottom] = useState(8)

  useEffect(() => {
    const rolesElement = rolesRef.current
    if (!rolesElement) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height

        // Визначаємо кількість рядків тексту
        const lines = Math.max(1, Math.round(height / LINE_HEIGHT_PX))

        // Отримуємо значення відступу
        setPaddingBottom(getDynamicPaddingBottom(lines))
      }
    })

    resizeObserver.observe(rolesElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [LINE_HEIGHT_PX])

  return {
    rolesRef,
    paddingBottom,
  }
}
