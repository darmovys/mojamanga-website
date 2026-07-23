import { Link } from '@tanstack/react-router'
import { HouseIcon } from 'lucide-react'
import ShiftBy from '../ShiftBy/ShiftBy'
import ClickTargetHelper from '../ClickTargetHelper'
import MobileNavigation from '../MobileNavigation'
import clsx from 'clsx'
import styles from './EmailVerified.module.scss'

function EmailVerified() {
  return (
    <>
      <div className={styles.Wrapper}>
        <h1 className={styles.Heading}>Пошта успішно підтверджена!</h1>
        <Link to="/" replace={true} className={clsx(styles.Link, 'Gradient')}>
          <ShiftBy y={-0.3}>
            <HouseIcon size={14} />
          </ShiftBy>
          На головну
          <ClickTargetHelper />
        </Link>
      </div>
      <MobileNavigation />
    </>
  )
}

export default EmailVerified
