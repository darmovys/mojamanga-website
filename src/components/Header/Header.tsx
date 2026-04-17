import { Button, Menu } from '@base-ui/react'
import styles from './Header.module.scss'
import { Bell, Ellipsis, Layers, LogIn, Moon, Plus, Sun } from 'lucide-react'
import clsx from 'clsx'
import Logo from '../Logo'
import { useTheme } from '@/lib/theme-provider'
import VisuallyHidden from '../VisuallyHidden'
import { Link } from '@tanstack/react-router'
import SearchContentField from '../SearchContentField'
import { Image } from '@unpic/react'
import { Catalog, catalogHandle } from './Catalog'
import { OtherLinks, otherLinksHandle } from './OtherLinks'
import { addContentHandle, AddContentMenu } from './AddContentMenu'
import { UserMenu, userMenuHandle } from './UserMenu'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authQueries } from '@/services/queries'

function Header() {
  const { theme, toggleTheme } = useTheme()

  const { data: authState } = useSuspenseQuery(authQueries.user())

  return (
    <header className={styles.Wrapper}>
      <div className={styles.FlexContainer}>
        <Link className={styles.LogoLink} to="/">
          <Logo />
        </Link>
        <Menu.Trigger
          handle={catalogHandle}
          render={
            <Button
              className={clsx({ [styles.PrimaryButton]: true, Gradient: true })}
            >
              <Layers size={18} />
              Каталог
            </Button>
          }
        />
        <Catalog />
      </div>
      <div className={styles.FlexContainer}>
        <SearchContentField className={styles.HeaderSearchField} />
        <Button onClick={toggleTheme} className={styles.TertiaryButton}>
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
        <Menu.Trigger
          handle={otherLinksHandle}
          render={
            <Button className={styles.TertiaryButton}>
              <Ellipsis />
              <VisuallyHidden>Інше</VisuallyHidden>
            </Button>
          }
        />
        <OtherLinks />
      </div>
      <div className={styles.FlexContainer}>
        {authState.isAuthenticated ? (
          <>
            <Menu.Trigger
              handle={addContentHandle}
              render={
                <Button
                  className={clsx({
                    [styles.SecondaryButton]: true,
                    Gradient: true,
                  })}
                >
                  <Plus />
                  <VisuallyHidden>Додавання контенту</VisuallyHidden>
                </Button>
              }
            />
            <AddContentMenu />
            <Button
              className={clsx({
                [styles.SecondaryButton]: true,
                Gradient: true,
              })}
            >
              <Bell />
              <VisuallyHidden>Сповіщення</VisuallyHidden>
            </Button>
            <Menu.Trigger
              handle={userMenuHandle}
              render={
                <Button
                  className={clsx({
                    [styles.UserButton]: true,
                    Gradient: true,
                  })}
                >
                  <Image
                    src={
                      authState.user.image ??
                      `https://api.dicebear.com/9.x/glass/svg?seed=${authState.user.displayUsername}`
                    }
                    alt={authState.user.name}
                    layout="fullWidth"
                  />
                  <VisuallyHidden>Користувач</VisuallyHidden>
                </Button>
              }
            />
            <UserMenu user={authState.user} />
          </>
        ) : (
          <Button
            nativeButton={false}
            render={<Link to="/login" />}
            className={clsx({ [styles.PrimaryButton]: true, Gradient: true })}
          >
            <LogIn size={18} />
            Вхід | Реєстрація
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
