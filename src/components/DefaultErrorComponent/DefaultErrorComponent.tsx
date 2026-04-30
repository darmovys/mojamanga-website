import { ErrorComponentProps, Link } from '@tanstack/react-router'
import styles from './DefaultErrorComponent.module.scss'
import MotionButton from '../MotionButton'
import { House, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

function DefaultErrorComponent({ reset, error }: ErrorComponentProps) {
  const isDev = import.meta.env.DEV
  return (
    <div className={styles.Wrapper}>
      <h1 className={styles.Heading}>
        Схоже, що виникла проблема при спробі завантажити сторінку.
      </h1>
      {isDev && <pre className={styles.DevError}>{error.message}</pre>}
      <div className={styles.ButtonsSection}>
        <MotionButton
          onClick={reset}
          className={clsx(styles.PrimaryButton, 'Gradient')}
        >
          <RefreshCw size={14} />
          <span>Спробувати знову</span>
        </MotionButton>
        <MotionButton
          render={<Link to="/" />}
          className={clsx(styles.SecondaryButton, 'Gradient')}
        >
          <House size={14} />
          <span>На головну</span>
        </MotionButton>
      </div>
    </div>
  )
}

export default DefaultErrorComponent
