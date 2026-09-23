import { AgeRestriction } from '@/generated/prisma/enums'
import { useLayoutEffect, useRef, useState } from 'react'

export interface BadgeItem {
  id: string
  label?: string
  ageRestriction?: AgeRestriction
}

export function useExpendableBadges(items: BadgeItem[]) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number>(items.length)
  const measureRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = measureRef.current
    if (!container) return

    const calculateVisibleCount = () => {
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>('[data-measure-badge]'),
      )
      if (nodes.length === 0) return

      // Знаходимо унікальні вертикальні лінії рядків
      const rowTops: number[] = []
      nodes.forEach((node) => {
        const top = node.offsetTop
        if (!rowTops.some((rTop) => Math.abs(rTop - top) < 4)) {
          rowTops.push(top)
        }
      })

      // Якщо всі елементи вільно лягають у 2 рядки або менше
      if (rowTops.length <= 2) {
        setVisibleCount(items.length)
        return
      }

      const secondRowTop = rowTops[1]
      const containerWidth = container.clientWidth
      const expandBtnEstimatedWidth = 65 // резерв місця під кнопку "+ ще N" разом із gap

      // Знаходимо всі бейджі, що знаходяться не нижче 2-го рядка
      let lastIndex = -1
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].offsetTop <= secondRowTop + 4) {
          lastIndex = i
        } else {
          break
        }
      }

      // Відступаємо назад, доки кнопка не поміститься на 2-му рядку
      while (lastIndex >= 0) {
        const node = nodes[lastIndex]
        const rightEdge = node.offsetLeft + node.offsetWidth
        if (containerWidth - rightEdge >= expandBtnEstimatedWidth) {
          break
        }
        lastIndex--
      }

      setVisibleCount(Math.max(1, lastIndex + 1))
    }

    calculateVisibleCount()

    const observer = new ResizeObserver(calculateVisibleCount)
    observer.observe(container)
    return () => observer.disconnect()
  }, [items])

  const hiddenCount = items.length - visibleCount
  const displayedItems = isExpanded ? items : items.slice(0, visibleCount)

  return {
    isExpanded,
    setIsExpanded,
    visibleCount,
    setVisibleCount,
    measureRef,
    hiddenCount,
    displayedItems,
  }
}
