import { getRouteApi, Link, Outlet, useLocation } from '@tanstack/react-router'
import { Button } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import {
  ArrowLeft,
  BellIcon,
  KeyRoundIcon,
  MonitorSmartphoneIcon,
  UserRoundIcon,
} from 'lucide-react'
import { useGoBack } from '@/hooks/use-go-back'
import ShiftBy from '../ShiftBy'
import MobileNavigation from '../MobileNavigation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authQueries } from '@/services/queries'
import { useSearchFieldScrollStore } from '@/stores/search-field-scroll-store'
import { motion } from 'motion/react'
import { useMediaQuery } from '@/hooks/use-media-query'
import styles from './SettingsLayout.module.scss'

const routeApi = getRouteApi('/user/$id_/settings')

function SettingsLayout() {
  const { id } = routeApi.useParams()
  const { handleGoBack } = useGoBack()
  const location = useLocation()
  const { data: authState } = useSuspenseQuery(authQueries.user())
  const isSearchFieldVisible = useSearchFieldScrollStore(
    (s) => s.isContentVisible,
  )
  const matches = useMediaQuery('(min-width: 40.625rem)') // має збігатися з tablet breakpoint

  const isRootPath = location.pathname === `/user/${id}/settings/root`

  const getHeaderTitle = () => {
    const path = location.pathname
    if (path.endsWith('/profile')) return 'Профіль'
    if (path.endsWith('/security')) return 'Безпека та вхід'
    if (path.endsWith('/notifications')) return 'Сповіщення'
    if (path.endsWith('/devices')) return 'Пристрої'
    return 'Налаштування'
  }

  return (
    <>
      <div data-is-root={isRootPath} className={styles.Wrapper}>
        <div className={styles.GoBackHeader}>
          <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
            <ClickTargetHelper />
            <ArrowLeft size={20} />
            <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
          </Button>
          <h1 className={styles.GoBackHeading}>{getHeaderTitle()}</h1>
        </div>
        <div className={styles.Grid}>
          <Link
            className={styles.Username}
            to="/user/$id/bookmarks"
            params={{ id }}
          >
            <ShiftBy y={-1}>
              <ArrowLeft size={24} />
            </ShiftBy>
            <ShiftBy y={-1}>
              <span>{authState.user?.displayUsername}</span>
            </ShiftBy>
          </Link>
          <motion.nav
            className={styles.Nav}
            animate={
              matches ? { top: isSearchFieldVisible ? '135px' : '80px' } : false
            }
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Link
              className={styles.NavLink}
              activeProps={{ className: styles.Active }}
              to="/user/$id/settings/profile"
              params={{ id }}
              /**
               * Оптимізація історії переходів для Split-View:
               * - На ПК: перемикання між секціями замінює поточний запис, щоб не накопичувати кліки.
               * - На мобільних: дозволяє функції handleGoBack коректно повернути користувача до списку налаштувань.
               */
              replace={!isRootPath}
            >
              <UserRoundIcon size={18} />
              <span>Профіль</span>
            </Link>
            <Link
              className={styles.NavLink}
              activeProps={{ className: styles.Active }}
              to="/user/$id/settings/security"
              params={{ id }}
              replace={!isRootPath}
            >
              <KeyRoundIcon size={18} />
              <span>Безпека та вхід</span>
            </Link>
            <Link
              className={styles.NavLink}
              activeProps={{ className: styles.Active }}
              to="/user/$id/settings/notifications"
              params={{ id }}
              replace={!isRootPath}
            >
              <BellIcon size={18} />
              <span>Сповіщення</span>
            </Link>
            <Link
              className={styles.NavLink}
              activeProps={{ className: styles.Active }}
              to="/user/$id/settings/devices"
              params={{ id }}
              replace={!isRootPath}
            >
              <MonitorSmartphoneIcon size={18} />
              <span>Пристрої</span>
            </Link>
          </motion.nav>
          <main className={styles.Main}>
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}

export default SettingsLayout
