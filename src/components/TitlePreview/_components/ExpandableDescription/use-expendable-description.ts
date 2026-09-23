import { useLayoutEffect, useRef, useState } from 'react'

export function useExpendableDescription(text: string | null) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [canOverflow, setCanOverflow] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return

    const checkOverflow = () => {
      // Отримуємо поточний line-height у пікселях
      const style = window.getComputedStyle(el)
      let lineHeight = parseFloat(style.lineHeight)

      // Запасний варіант, якщо браузер поверне 'normal'
      if (Number.isNaN(lineHeight)) {
        lineHeight = parseFloat(style.fontSize) * 1.5
      }

      // Висота рівно 3 рядків із запасом у 2px на субпіксельний рендеринг
      const maxThreeLinesHeight = lineHeight * 3 + 2

      // Якщо повна висота тексту більша за 3 рядки — потрібне згортання
      setCanOverflow(el.scrollHeight > maxThreeLinesHeight)
    }

    checkOverflow()

    // Відстежуємо зміни розмірів контейнера прев'ю
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)

    return () => observer.disconnect()
  }, [text])

  return {
    isExpanded,
    setIsExpanded,
    canOverflow,
    setCanOverflow,
    textRef,
  }
}
