import { create } from 'zustand'

const HEADER_HIDE_THRESHOLD = 60 // Має збігатися з висотою компонента GlobalSearchSection
const WIDE_SCREEN_QUERY = `(min-width: 68.75rem)` // Має збігатися з laptop breakpoint

type ScrollStore = {
  isContentVisible: boolean
  setIsContentVisible: (visible: boolean) => void
}

export const useSearchFieldScrollStore = create<ScrollStore>((set) => ({
  isContentVisible: true,
  setIsContentVisible: (visible) => set({ isContentVisible: visible }),
}))

if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia(WIDE_SCREEN_QUERY)

  // Якщо широкий екран — завжди false
  const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      useSearchFieldScrollStore.setState({ isContentVisible: false })
    }
  }

  // Перевірка при ініціалізації
  handleMediaChange(mediaQuery)
  mediaQuery.addEventListener('change', handleMediaChange)

  // Scroll-логіка — спрацьовує лише на вузьких екранах
  let previousScrollValue: number | undefined

  window.addEventListener('scroll', () => {
    if (mediaQuery.matches) return // ігноруємо scroll на широких екранах

    const currentScroll = window.scrollY

    if (previousScrollValue === undefined) {
      previousScrollValue = currentScroll
      return
    }

    const direction = currentScroll > previousScrollValue ? 'down' : 'up'
    const { isContentVisible, setIsContentVisible } = useSearchFieldScrollStore.getState()

    if (isContentVisible && direction === 'down' && currentScroll > HEADER_HIDE_THRESHOLD) {
      setIsContentVisible(false)
    } else if (!isContentVisible && direction === 'up') {
      setIsContentVisible(true)
    }

    previousScrollValue = currentScroll
  })
}