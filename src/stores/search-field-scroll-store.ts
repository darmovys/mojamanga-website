import { create } from 'zustand'

const HEADER_HIDE_THRESHOLD = 60 // Має збігатися з висотою компонента GlobalSearchSection

type ScrollStore = {
  isContentVisible: boolean
  setIsContentVisible: (visible: boolean) => void
}

export const useSearchFieldScrollStore = create<ScrollStore>((set) => ({
  isContentVisible: true,
  setIsContentVisible: (visible) => set({ isContentVisible: visible }),
}))

if (typeof window !== 'undefined') {
  let previousScrollValue: number | undefined

  window.addEventListener('scroll', () => {
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