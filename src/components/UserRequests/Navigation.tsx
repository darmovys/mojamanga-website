import { getRouteApi, Link } from '@tanstack/react-router'
import styles from './NavigationLayout.module.scss'

const links = [
  { label: 'Команди', url: '/user/$id/requests/teams' },
  { label: 'Твори', url: '/user/$id/requests/titles' },
  { label: 'Розділи', url: '/user/$id/requests/chapters' },
]

const routeApi = getRouteApi('/user/$id_/requests')

interface NavigationProps {
  onLinkClick?: () => void
}

export function Navigation({ onLinkClick }: NavigationProps) {
  const { id } = routeApi.useParams()

  return (
    <ul className={styles.Navigation}>
      {links.map((item) => (
        <li key={item.label} className={styles.NavItem}>
          <Link
            to={item.url}
            params={{ id }}
            replace={true}
            className={styles.NavigationLink}
            activeProps={{ className: styles.ActiveLink }}
            onClick={onLinkClick}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
