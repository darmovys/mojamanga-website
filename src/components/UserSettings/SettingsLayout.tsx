import { getRouteApi, Link, Outlet, useLocation } from '@tanstack/react-router'
import { Button } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import { ArrowLeft, BellIcon, KeyRoundIcon, UserRoundIcon } from 'lucide-react'
import { useGoBack } from '@/hooks/use-go-back'
import ShiftBy from '../ShiftBy/ShiftBy'
import MobileNavigation from '../MobileNavigation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authQueries } from '@/services/queries'
import styles from './SettingsLayout.module.scss'

const routeApi = getRouteApi('/user/$id_/settings')

function SettingsLayout() {
  const { id } = routeApi.useParams()
  const { handleGoBack } = useGoBack()
  const location = useLocation()
  const { data: authState } = useSuspenseQuery(authQueries.user())

  const isRootPath = location.pathname === `/user/${id}/settings/root`

  const getHeaderTitle = () => {
    const path = location.pathname
    if (path.endsWith('/profile')) return 'Профіль'
    if (path.endsWith('/security')) return 'Безпека та вхід'
    if (path.endsWith('/notifications')) return 'Сповіщення'
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
          <nav className={styles.Nav}>
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
          </nav>
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
