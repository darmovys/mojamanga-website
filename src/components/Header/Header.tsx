import styles from './Header.module.scss'
import { Link, linkOptions } from '@tanstack/react-router'
import { House, Bookmark, Layers, Bell, Menu } from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'

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

export default function Header() {
  return (
    <header className={styles.Header}>
      {navLinks.map((item) => {
        return (
          /* Цей NavItem не дозволяє посиланню перенаправляти користувача.
          Варто перенести стилі з NavItem на NavLink зі збереженою логікою
          Оскільки наше меню не повністю складається з посилань, можна
          скористатися компонентом Button бібліотеки Base UI, який дозволить
          рендерити лише певні кнопки, як посилання.
          */

          <Link
            activeProps={{ className: styles.ActiveItem }}
            key={item.title}
            className={styles.NavItem}
            to={item.to}
          >
            <item.icon className={styles.Icon} size={18} />
            <span className={styles.ItemTitle}>{item.title}</span>
          </Link>
        )
      })}
      <button className={styles.NavItem}>
        <Menu className={styles.Icon} size={18} />
        <span className={styles.ItemTitle}>Меню</span>
      </button>
    </header>
  )
}
