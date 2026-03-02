import styles from './MobileNavigation.module.scss'
import { Link, linkOptions } from '@tanstack/react-router'
import { House, Bookmark, Layers, Bell, Menu } from 'lucide-react'
import MobileMenu from '../MobileMenu'
import clsx from 'clsx'

const navLinks = linkOptions([
  {
    title: 'Каталог',
    icon: Layers,
    to: '/catalog',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Закладки',
    icon: Bookmark,
    to: '/bookmarks',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Головна',
    icon: House,
    to: '/',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Сповіщення',
    icon: Bell,
    to: '/notifications',
    activeOptions: {
      exact: false,
    },
  },
])

export default function MobileNavigation() {
  return (
    <nav className={styles.Wrapper}>
      {navLinks.map((item) => {
        return (
          <div className={styles.NavItem} key={item.title}>
            <Link
              activeProps={{ className: styles.ActiveLink }}
              className={clsx({ [styles.NavLink]: true, Gradient: true })}
              to={item.to}
            >
              <item.icon className={styles.NavLinkIcon} size={18} />
              <span className={styles.ItemTitle}>{item.title}</span>
            </Link>
          </div>
        )
      })}
      <div className={styles.NavItem}>
        <MobileMenu
          trigger={(openDialog) => (
            <button
              onClick={openDialog}
              className={clsx({ [styles.NavLink]: true, Gradient: true })}
            >
              <Menu className={styles.NavLinkIcon} size={18} />
              <span className={styles.ItemTitle}>Меню</span>
            </button>
          )}
        />
      </div>
    </nav>
  )
}
