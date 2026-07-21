import { Menu, Separator } from '@base-ui/react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { getUserLinks } from '@/lib/navigation-links'
import clsx from 'clsx'
import { Image } from '@unpic/react'
import { User } from '@/lib/auth'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { ArrowSvg } from './ArrowSvg'
import styles from './DropdownMenu.module.scss'
import { useQueryClient } from '@tanstack/react-query'
import { authQueries } from '@/services/queries'
import { useMediaQuery } from '@/hooks/use-media-query'

export const userMenuHandle = Menu.createHandle()

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const isTabletOrUp = useMediaQuery('(min-width: 40.625rem)')
  const navigate = useNavigate()
  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: authQueries.all,
          })

          await router.invalidate()

          showTimedToast(
            {
              type: 'success',
              title: 'Успіх',
              description: 'Ви вийшли з акаунту',
            },
            4000,
          )
          userMenuHandle.close()
          navigate({ to: '/' })
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

  const userLinks = getUserLinks(user.id, isTabletOrUp)

  return (
    <Menu.Root handle={userMenuHandle}>
      <Menu.Portal>
        <Menu.Positioner className={styles.Positioner} sideOffset={10}>
          <Menu.Popup className={styles.Popup}>
            <Menu.Arrow className={styles.Arrow}>
              <ArrowSvg />
            </Menu.Arrow>
            <Menu.Item
              className={clsx(styles.UserItem)}
              render={<Link to="/user/$id" params={{ id: user.id }} />}
            >
              <Image
                src={
                  user.image
                    ? `${import.meta.env.VITE_STORAGE_URL}${user.image}`
                    : `https://api.dicebear.com/9.x/glass/svg?seed=${user.displayUsername}`
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
                      render={<Link to={link.to} search={link.search} />}
                      key={link.title}
                      className={styles.UserMenuItem}
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
                    render={<Link to={link.to} params={{ id: user.id }} />}
                    key={link.title}
                    className={styles.UserMenuItem}
                  >
                    <link.icon size={18} />
                    <span>{link.title}</span>
                  </Menu.Item>
                )
              }
            })}
            <Separator orientation="horizontal" className={styles.Separator} />
            <Menu.Item onClick={handleLogout} className={styles.ExitButton}>
              <LogOut size={18} />
              <span>Вийти</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
