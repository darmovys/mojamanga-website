import styles from './ModerationMenu.module.scss'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import { ArrowLeft, Menu } from 'lucide-react'
import { Button } from '@base-ui/react'

import { useGoBack } from '@/hooks/use-go-back'
import VisuallyHidden from '../VisuallyHidden'
import MotionButton from '../MotionButton'
import { NavItems } from './NavItems'
import ModerationMenuMobileDialog from './ModerationMenuMobileDialog'

function ModerationMenu() {
  const { handleGoBack } = useGoBack()
  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
        </Button>
        <h1 className={styles.GoBackHeading}>Модерація</h1>
        <ModerationMenuMobileDialog
          trigger={(openDialog) => (
            <MotionButton
              onClick={openDialog}
              className={styles.MobileMenuButton}
            >
              <Menu size={20} />
              <VisuallyHidden>Меню</VisuallyHidden>
            </MotionButton>
          )}
        />
      </div>
      <div className={styles.Grid}>
        <nav className={styles.GridNavItem}>
          <NavItems separator={'light'} />
        </nav>

        <div className={styles.GridItem}>TODO</div>
      </div>
    </div>
  )
}

export default ModerationMenu
