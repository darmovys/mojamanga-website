import { Button, Menu, Separator } from '@base-ui/react'
import { Link } from '@tanstack/react-router'
import { userLinks } from '@/lib/navigation-links'
import clsx from 'clsx'
import { Image } from '@unpic/react'
import { User } from '@/lib/auth'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { ArrowSvg } from './ArrowSvg'
import styles from './DropdownMenu.module.scss'

export const userMenuHandle = Menu.createHandle()

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          showTimedToast(
            {
              type: 'success',
              title: 'Успіх',
              description: 'Ви вийшли з акаунту',
            },
            4000,
          )
          userMenuHandle.close()
        },
        onError: ({ error }) => {
          showTimedToast(
            {
              type: 'error',
              title: 'Сталася помилка',
              description: error.message,
            },
            6000,
          )
        },
      },
    })
  }

  return (
    <Menu.Root handle={userMenuHandle}>
      <Menu.Portal>
        <Menu.Positioner className={styles.Positioner} sideOffset={10}>
          <Menu.Popup className={styles.UserPopup}>
            <Menu.Arrow className={styles.Arrow}>
              <ArrowSvg />
            </Menu.Arrow>
            <Menu.Item
              className={clsx(styles.UserItem)}
              render={<Link to="/about" />}
            >
              <Image
                src={
                  user.image ??
                  `https://api.dicebear.com/9.x/glass/svg?seed=${user.displayUsername}`
                }
                alt={user.name}
                layout="constrained"
                width={45}
                height={45}
              />
              <div className={styles.UserInfo}>
                <span>{user.displayUsername}</span>
                <span>Користувач</span>
              </div>
            </Menu.Item>
            {userLinks.map((link) => {
              if (link.title === 'Модераторска') {
                if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
                  return (
                    <Menu.Item
                      render={<Link to={link.to} />}
                      key={link.title}
                      className={styles.Item}
                    >
                      <link.icon size={18} />
                      <span>{link.title}</span>
                    </Menu.Item>
                  )
                } else {
                  return null
                }
              } else {
                return (
                  <Menu.Item
                    render={<Link to={link.to} />}
                    key={link.title}
                    className={styles.Item}
                  >
                    <link.icon size={18} />
                    <span>{link.title}</span>
                  </Menu.Item>
                )
              }
            })}
            <Separator orientation="horizontal" className={styles.Separator} />
            <Menu.Item
              onClick={handleLogout}
              render={<Button />}
              className={styles.ExitButton}
            >
              <LogOut size={18} />
              <span>Вийти</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
