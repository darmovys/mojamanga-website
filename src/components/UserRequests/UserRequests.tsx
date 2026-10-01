import { Button } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import { ArrowLeft, Menu } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { useGoBack } from '@/hooks/use-go-back'
import { motion } from 'motion/react'
import { useSearchFieldScrollStore } from '@/stores/search-field-scroll-store'
import { Outlet } from '@tanstack/react-router'
import { Navigation } from './_components'
import MotionButton from '../MotionButton'
import { useState } from 'react'
import { DialogNavigation } from './_components'
import MobileNavigation from '../MobileNavigation'
import styles from './UserRequests.module.scss'

function UserRequests() {
  const [isOpen, setIsOpen] = useState(false)
  const { handleGoBack } = useGoBack()
  const isSearchFieldVisible = useSearchFieldScrollStore(
    (s) => s.isContentVisible,
  )

  return (
    <>
      <div className={styles.MaxWidthWrapper}>
        <div className={styles.GoBackHeader}>
          <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
            <ClickTargetHelper />
            <ArrowLeft size={20} />
            <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
          </Button>
          <h1 className={styles.GoBackHeading}>Мої запити</h1>
          <MotionButton
            onClick={() => setIsOpen(!isOpen)}
            className={styles.MobileMenuButton}
          >
            <ClickTargetHelper />
            <Menu size={20} />
            <VisuallyHidden>Меню</VisuallyHidden>
          </MotionButton>
          <DialogNavigation isOpen={isOpen} onIsOpenChange={setIsOpen} />
        </div>
        <div className={styles.Grid}>
          <motion.nav
            className={styles.GridNavItem}
            animate={{ top: isSearchFieldVisible ? '137px' : '80px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Navigation />
          </motion.nav>
          <div className={styles.GridMainSectionItem}>
            <Outlet />
          </div>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}

export default UserRequests
