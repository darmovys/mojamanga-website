import { createFileRoute, Link } from '@tanstack/react-router'
import styles from '@/routes/about.module.scss'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      {' '}
      <h1 className={styles.header}>Hello "/about"!</h1>
      <Link to="/">index</Link>
    </>
  )
}
