import { Link } from '@tanstack/react-router'
import MotionButton from '../MotionButton'
import styles from './Forbidden.module.scss'
import clsx from 'clsx'
import { House } from 'lucide-react'
import MobileNavigation from '../MobileNavigation'

function Forbidden() {
  return (
    <>
      <div className={styles.Wrapper}>
        <p className={styles.Message}>
          У вас недостатньо прав для цієї сторінки
        </p>
        <MotionButton
          nativeButton={false}
          render={<Link to="/" />}
          className={clsx(styles.HomeButton, 'Gradient')}
        >
          <House size={14} />
          <span>На головну</span>
        </MotionButton>
      </div>
      <MobileNavigation />
    </>
  )
}

export default Forbidden
