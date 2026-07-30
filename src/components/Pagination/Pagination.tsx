import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Button } from '@base-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MotionButton from '../MotionButton'
import VisuallyHidden from '../VisuallyHidden'
import styles from './Pagination.module.scss'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const [pageValue, setPageValue] = useState('')

  // Скидаємо інпут при зміні сторінки ззовні
  useEffect(() => {
    setPageValue('')
  }, [currentPage])

  if (totalPages <= 1) return null

  const handleJumpToPage = () => {
    const p = Number(pageValue)
    if (p >= 1 && p <= totalPages) {
      onPageChange(p)
    }
  }

  // Логіка визначення діапазону відображення сторінок
  let startPage = Math.max(1, currentPage - 1)
  let endPage = Math.min(totalPages, startPage + 2)

  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2)
  }

  const consecutivePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  )

  return (
    <div className={clsx(styles.PaginationSection, className)}>
      <div className={styles.PageControls}>
        {/* Кнопка "Попередня" */}
        {currentPage === 1 ? (
          <Button className={clsx(styles.PageButton, styles.Disabled)} disabled>
            <VisuallyHidden>Попередня сторінка</VisuallyHidden>
            <ChevronLeft size={20} />
          </Button>
        ) : (
          <MotionButton
            onClick={() => onPageChange(currentPage - 1)}
            className={styles.PageButton}
          >
            <VisuallyHidden>Попередня сторінка</VisuallyHidden>
            <ChevronLeft size={20} />
          </MotionButton>
        )}

        {/* Послідовні сторінки */}
        {consecutivePages.map((p) => (
          <MotionButton
            key={p}
            data-active={currentPage === p ? '' : undefined}
            disabled={currentPage === p}
            onClick={() => onPageChange(p)}
            className={styles.PageButton}
          >
            {p}
          </MotionButton>
        ))}

        {/* Трикрапка */}
        {endPage < totalPages - 1 && (
          <div className={styles.PagesDivider}>...</div>
        )}

        {/* Остання сторінка */}
        {endPage < totalPages && (
          <MotionButton
            onClick={() => onPageChange(totalPages)}
            data-active={currentPage === totalPages ? '' : undefined}
            className={styles.PageButton}
          >
            {totalPages}
          </MotionButton>
        )}

        {/* Кнопка "Наступна" */}
        {currentPage === totalPages ? (
          <Button className={clsx(styles.PageButton, styles.Disabled)} disabled>
            <ChevronRight />
            <VisuallyHidden>Наступна сторінка</VisuallyHidden>
          </Button>
        ) : (
          <MotionButton
            onClick={() => onPageChange(currentPage + 1)}
            className={clsx(styles.PageButton)}
          >
            <ChevronRight />
            <VisuallyHidden>Наступна сторінка</VisuallyHidden>
          </MotionButton>
        )}
      </div>

      {/* Швидкий перехід до сторінки */}
      <div className={styles.GoToSpecificPage}>
        <span>Перейти до:</span>
        <input
          className={styles.PageInput}
          value={pageValue}
          inputMode="numeric"
          onChange={(e) => setPageValue(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
        />
      </div>
    </div>
  )
}
