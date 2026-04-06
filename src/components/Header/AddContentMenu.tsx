import { Menu } from '@base-ui/react'
import { Link } from '@tanstack/react-router'
import { addContentLinks } from '@/lib/navigation-links'
import { ArrowSvg } from './ArrowSvg'
import styles from './DropdownMenu.module.scss'

export const addContentHandle = Menu.createHandle()

export function AddContentMenu() {
  return (
    <Menu.Root handle={addContentHandle}>
      <Menu.Portal>
        <Menu.Positioner className={styles.Positioner} sideOffset={10}>
          <Menu.Popup className={styles.Popup}>
            <Menu.Arrow className={styles.Arrow}>
              <ArrowSvg />
            </Menu.Arrow>
            {addContentLinks.map((link) => (
              <Menu.Item
                render={<Link to={link.to} />}
                key={link.title}
                className={styles.AddContentItem}
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
