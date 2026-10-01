import { getRouteApi, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useId, type MouseEvent } from 'react'
import { Separator } from '@base-ui/react'
import styles from './Tabs.module.scss'

const links = {
  teams: [
    { label: 'На перевірці', value: 'pending' },
    { label: 'Схвалені', value: 'approved' },
    { label: 'Відхилені', value: 'rejected' },
  ],
  titles: [
    { label: 'На перевірці', value: 'pending' },
    { label: 'Схвалені', value: 'approved' },
    { label: 'Відхилені', value: 'rejected' },
  ],
  chapters: [
    { label: 'На перевірці', value: 'pending' },
    { label: 'Схвалені', value: 'approved' },
  ],
} as const

const routeApi = getRouteApi('/user/$id_/requests')

interface TabsProps {
  name: string
  route: 'teams' | 'titles' | 'chapters'
}

export function Tabs({ name, route }: TabsProps) {
  const { id } = routeApi.useParams()
  const layoutId = useId()

  function handleItemClick(e: MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }
  return (
    <>
      <h1 className={styles.Heading}>{name}</h1>
      <nav className={styles.Navigation}>
        {links[route].map((item) => (
          <Link
            key={item.value}
            className={styles.NavLink}
            to="."
            params={{ id }}
            replace={true}
            search={{ status: item.value }}
            onClick={handleItemClick}
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>

                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    initial={{
                      borderTopLeftRadius: 'var(--4px)',
                      borderTopRightRadius: 'var(--4px)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                    className={styles.Indicator}
                  />
                )}
              </>
            )}
          </Link>
        ))}
      </nav>
      <Separator orientation="horizontal" className={styles.Separator} />
    </>
  )
}
