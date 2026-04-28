import React from 'react'
import SearchContentField from '../SearchContentField'
import styles from './GlobalSearchSection.module.scss'
import { useSearchFieldScrollStore } from '@/stores/search-field-scroll-store'

interface GlobalSearchSection {
  isHiddenOnMobile: boolean
}

export default function GlobalSearchSection({
  isHiddenOnMobile,
}: GlobalSearchSection) {
  const isContentVisible = useSearchFieldScrollStore((s) => s.isContentVisible)

  const transform = isContentVisible ? 'translateY(0)' : 'translateY(-100%)'
  const display = isHiddenOnMobile ? 'none' : 'block'

  return (
    <div
      style={{ transform, '--display': display } as React.CSSProperties}
      className={styles.Wrapper}
    >
      <SearchContentField />
    </div>
  )
}
