import { Menu } from '@base-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { catalogLinks, workTypeLinks } from '@/lib/navigation-links'
import { ArrowSvg } from './ArrowSvg'
import styles from './DropdownMenu.module.scss'

export const catalogHandle = Menu.createHandle()

export function Catalog() {
  return (
    <Menu.Root handle={catalogHandle}>
      <Menu.Portal>
        <Menu.Positioner className={styles.Positioner} sideOffset={10}>
          <Menu.Popup className={styles.Popup}>
            <Menu.Arrow className={styles.Arrow}>
              <ArrowSvg />
            </Menu.Arrow>
            {catalogLinks.map((link) => {
              if (link.title === 'Твори') {
                return (
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger
                      className={styles.SubmenuTrigger}
                      render={<Link to={link.to} />}
                    >
                      <link.icon size={18} />
                      <span>{link.title}</span>
                      <ChevronRight className={styles.ChevronRight} size={18} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner
                        sideOffset={1}
                        alignOffset={1}
                        className={styles.Positioner}
                      >
                        <Menu.Popup className={styles.Popup}>
                          {workTypeLinks.map((link) => (
                            <Menu.Item
                              render={
                                <Link to={link.to} search={link.search} />
                              }
                              key={link.title}
                              className={styles.Item}
                            >
                              <span>{link.title}</span>
                            </Menu.Item>
                          ))}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                )
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
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
