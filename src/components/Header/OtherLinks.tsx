import { Menu } from '@base-ui/react'
import { Link } from '@tanstack/react-router'
import { otherLinks } from '@/lib/navigation-links'
import { ArrowSvg } from './ArrowSvg'
import styles from './DropdownMenu.module.scss'

export const otherLinksHandle = Menu.createHandle()

export function OtherLinks() {
  return (
    <Menu.Root handle={otherLinksHandle}>
      <Menu.Portal>
        <Menu.Positioner className={styles.Positioner} sideOffset={10}>
          <Menu.Popup className={styles.Popup}>
            <Menu.Arrow className={styles.Arrow}>
              <ArrowSvg />
            </Menu.Arrow>
            {otherLinks.map((link) => (
              <Menu.Item
                render={<Link to={link.to} />}
                key={link.title}
                className={styles.Item}
              >
                <link.icon size={18} />
                <span>{link.title}</span>
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
