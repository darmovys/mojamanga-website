import Fade from 'embla-carousel-fade'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const AUTOPLAY_DURATION = 6000 // Тривалість показу слайда (6 секунд)
const TIMER_STEP = 50 // Частота оновлення прогресу (мс)

export function useHeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)

  // 1. Головний слайдер із Fade ефектом
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Fade(),
  ])

  // 2. Слайдер для мініатюр з вільним прокручуванням
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  // Навігація кнопками
  const scrollPrev = useCallback(
    () => mainApi && mainApi.scrollPrev(),
    [mainApi],
  )
  const scrollNext = useCallback(
    () => mainApi && mainApi.scrollNext(),
    [mainApi],
  )

  // Клік по картці з мініатюри
  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return
      mainApi.scrollTo(index)
      elapsedRef.current = 0
      setProgress(0)
    },
    [mainApi],
  )

  // Синхронізація індексу активного слайда
  const onSelect = useCallback(() => {
    if (!mainApi || !thumbsApi) return
    const index = mainApi.selectedScrollSnap()
    setSelectedIndex(index)
    thumbsApi.scrollTo(index)

    // Скидання таймера при зміні слайда
    elapsedRef.current = 0
    setProgress(0)
  }, [mainApi, thumbsApi])

  // Підписка на події головного слайдера
  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on('select', onSelect)
    mainApi.on('reInit', onSelect)
  }, [mainApi, onSelect])

  // Логіка циклу кругового таймера та автоперемикання
  useEffect(() => {
    if (!mainApi) return

    timerRef.current = setInterval(() => {
      if (isPaused) return

      elapsedRef.current += TIMER_STEP
      const currentPercent = (elapsedRef.current / AUTOPLAY_DURATION) * 100
      setProgress(Math.min(currentPercent, 100))

      if (elapsedRef.current >= AUTOPLAY_DURATION) {
        mainApi.scrollNext()
        elapsedRef.current = 0
        setProgress(0)
      }
    }, TIMER_STEP)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [mainApi, isPaused])

  return {
    selectedIndex,
    progress,
    mainRef,
    thumbsRef,
    setIsPaused,
    scrollPrev,
    scrollNext,
    onThumbClick,
  }
}
