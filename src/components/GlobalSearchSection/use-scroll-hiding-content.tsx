import { useEffect, useState } from 'react'

const HEADER_HIDE_THRESHOLD = 60 // Має збігатися з висотою компонента GlobalSearchSection

export default function useScrollHidingContent() {
  const [isContentVisible, setIsContentVisible] = useState(true)

  useEffect(() => {
    let previousScrollValue: unknown

    function handleScroll() {
      const currentScroll = window.scrollY

      if (typeof previousScrollValue !== 'number') {
        previousScrollValue = currentScroll
        return
      }

      const direction = currentScroll > previousScrollValue ? 'down' : 'up'

      if (
        isContentVisible &&
        direction === 'down' &&
        currentScroll > HEADER_HIDE_THRESHOLD
      ) {
        setIsContentVisible(false)
      } else if (!isContentVisible && direction === 'up') {
        setIsContentVisible(true)
      }

      previousScrollValue = currentScroll
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isContentVisible])

  return {
    isContentVisible,
    setIsContentVisible,
  }
}
