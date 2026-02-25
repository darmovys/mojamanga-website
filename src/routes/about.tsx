import { createFileRoute, Link } from '@tanstack/react-router'
import styles from '@/routes/about.module.scss'
import { useTheme } from '@/lib/theme-provider'
import { Sun, Moon, Clock } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else if (theme === 'system') {
      setTheme('light')
    } else {
      setTheme('light')
    }
  }

  return (
    <>
      {' '}
      <h1 className={styles.header}>Hello "/about"!</h1>
      <Link to="/">index</Link>
      <button onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun size={16} />
        ) : theme === 'dark' ? (
          <Moon size={16} />
        ) : (
          <Clock size={16} />
        )}
      </button>
    </>
  )
}
