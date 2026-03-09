import { Button } from '@base-ui/react'
import styles from './Header.module.scss'
import {
  Bell,
  Ellipsis,
  Layers,
  LogIn,
  Moon,
  Plus,
  Sun,
  SunMoon,
} from 'lucide-react'
import clsx from 'clsx'
import Logo from '../Logo'
import { useTheme } from '@/lib/theme-provider'
import VisuallyHidden from '../VisuallyHidden'
import { Link } from '@tanstack/react-router'
import SearchContentField from '../SearchContentField'
import { Image } from '@unpic/react'
import { useState } from 'react'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isAuthed, setIsAuthed] = useState(false) // Імітований статус. Варто прибрати
  return (
    <header className={styles.Wrapper}>
      <div className={styles.FlexContainer}>
        <Link style={{ textDecoration: 'none' }} to="/">
          <Logo />
        </Link>
        <Button
          className={clsx({ [styles.PrimaryButton]: true, Gradient: true })}
        >
          <Layers size={18} />
          Каталог
        </Button>
      </div>
      <div className={styles.FlexContainer}>
        <SearchContentField className={styles.HeaderSearchField} />
        <Button onClick={toggleTheme} className={styles.TertiaryButton}>
          {theme === 'system' && (
            <>
              <SunMoon />
              <VisuallyHidden>Системна тема</VisuallyHidden>
            </>
          )}
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
        <Button className={styles.TertiaryButton}>
          <Ellipsis />
          <VisuallyHidden>Інше</VisuallyHidden>
        </Button>
      </div>
      <div className={styles.FlexContainer}>
        {isAuthed ? (
          <>
            <Button
              className={clsx({
                [styles.SecondaryButton]: true,
                Gradient: true,
              })}
            >
              <Plus />
              <VisuallyHidden>Додавання контенту</VisuallyHidden>
            </Button>
            <Button
              className={clsx({
                [styles.SecondaryButton]: true,
                Gradient: true,
              })}
            >
              <Bell />
              <VisuallyHidden>Сповіщення</VisuallyHidden>
            </Button>
            <Button
              className={clsx({ [styles.UserButton]: true, Gradient: true })}
            >
              <Image
                src="https://api.dicebear.com/9.x/glass/svg?seed=Blue"
                alt="User Avatar"
                layout="fullWidth"
              />
              <VisuallyHidden>Сповіщення</VisuallyHidden>
            </Button>
          </>
        ) : (
          <Button
            nativeButton={false}
            render={<Link to="/signup" />}
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
