import { createFileRoute, Link } from '@tanstack/react-router'
import styles from './index.module.scss'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <h1 className={styles.header}>
        Купуй книжки видавництва Vivat зі знижкою 20%
      </h1>

      <Link to="/about">About</Link>
    </div>
  )
}
