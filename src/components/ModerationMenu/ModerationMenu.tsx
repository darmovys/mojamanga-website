import styles from './ModerationMenu.module.scss'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import { ArrowLeft, Menu } from 'lucide-react'
import { Button } from '@base-ui/react'

import { useGoBack } from '@/hooks/use-go-back'
import VisuallyHidden from '../VisuallyHidden'
import MotionButton from '../MotionButton'
import { NavItems } from './NavItems'
import ModerationMenuMobileDialog from './ModerationMenuMobileDialog'
import { getRouteApi } from '@tanstack/react-router'
import TeamsRequestsList, { TeamsRequestsSkeleton } from './TeamsRequestsList'
import { useSearchFieldScrollStore } from '@/stores/search-field-scroll-store'
import { motion } from 'motion/react'
import MobileNavigation from '../MobileNavigation'
import PeopleRequestsList, {
  PeopleRequestsSkeleton,
} from './PeopleRequestsList'
import WorksRequestsList, { WorksRequestsSkeleton } from './WorksRequestsList'

const routeApi = getRouteApi('/moderation/')

function ModerationMenuLayout({ children }: { children: React.ReactNode }) {
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
          <h1 className={styles.GoBackHeading}>Модерація</h1>
          <ModerationMenuMobileDialog
            trigger={(openDialog) => (
              <MotionButton
                onClick={openDialog}
                className={styles.MobileMenuButton}
              >
                <ClickTargetHelper />
                <Menu size={20} />
                <VisuallyHidden>Меню</VisuallyHidden>
              </MotionButton>
            )}
          />
        </div>
        <div className={styles.Grid}>
          <motion.nav
            className={styles.GridNavItem}
            animate={{ top: isSearchFieldVisible ? '137px' : '80px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <NavItems separator={'light'} />
          </motion.nav>
          <div className={styles.GridMainSectionItem}>{children}</div>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}

function ModerationMenu() {
  const sectionType = routeApi.useSearch({ select: ({ type }) => type })

  return (
    <ModerationMenuLayout>
      {sectionType === 'teams' && <TeamsRequestsList />}
      {sectionType === 'people' && <PeopleRequestsList />}
      {sectionType === 'works' && <WorksRequestsList />}
    </ModerationMenuLayout>
  )
}

export function ModerationMenuSkeleton() {
  const sectionType = routeApi.useSearch({ select: ({ type }) => type })

  return (
    <ModerationMenuLayout>
      {sectionType === 'teams' && <TeamsRequestsSkeleton />}
      {sectionType === 'people' && <PeopleRequestsSkeleton />}
      {sectionType === 'works' && <WorksRequestsSkeleton />}
    </ModerationMenuLayout>
  )
}

export default ModerationMenu
