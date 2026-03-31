import { createFileRoute, Link } from '@tanstack/react-router'
import styles from './index.module.scss'
import GlobalSearchSection from '@/components/GlobalSearchSection'

export const Route = createFileRoute('/')({
  staticData: { showGlobalSearchSection: false },
  component: App,
})

function App() {
  return (
    <>
      <GlobalSearchSection isHiddenOnMobile={false} />

      <h1 className={styles.header}>
        Купуй книжки видавництва Vivat зі знижкою 20%
      </h1>

      <Link to="/about">About</Link>
    </>
  )
}
