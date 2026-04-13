import { createFileRoute, Link } from '@tanstack/react-router'
import styles from './index.module.scss'
import GlobalSearchSection from '@/components/GlobalSearchSection'
import MobileNavigation from '@/components/MobileNavigation'

export const Route = createFileRoute('/')({
  staticData: { showGlobalSearchSection: false },
  component: App,
})

function App() {
  return (
    <>
      <div className={styles.Wrapper}>
        <GlobalSearchSection isHiddenOnMobile={false} />

        <h1 className={styles.header}>
          Купуй книжки видавництва Vivat зі знижкою 20%
        </h1>

        <Link to="/about">About</Link>
      </div>
      <MobileNavigation />
    </>
  )
}
