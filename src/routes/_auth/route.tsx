import { useTheme } from '@/lib/theme-provider'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import styles from './route.module.scss'
import { Button } from '@base-ui/react'
import Logo from '@/components/Logo'
import { Moon, Sun } from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  staticData: {
    showMobileNavbar: false,
    showGlobalSearchSection: false,
    showStandardHeader: false,
  },
})

function RouteComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Flex}>
        <header className={styles.MainHeader}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo className={styles.Logo} />
          </Link>
          <Button onClick={toggleTheme} className={styles.ThemeButton}>
            {theme === 'light' && (
              <>
                <Sun />
                <VisuallyHidden>Світла тема</VisuallyHidden>
              </>
            )}
            {theme === 'dark' && (
              <>
                <Moon />
                <VisuallyHidden>Темна тема</VisuallyHidden>
              </>
            )}
          </Button>
        </header>
      </div>
      <div className={styles.MainSectionWrapper}>
        <main className={styles.MainSection}>
          <div className={styles.Content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
