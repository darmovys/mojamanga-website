import { createFileRoute } from '@tanstack/react-router'
import styles from './create.module.scss'
import GoBackHeader from '@/components/GoBackHeader'
import { Button } from '@base-ui/react'
import { UploadCloud } from 'lucide-react'

export const Route = createFileRoute('/team/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={styles.MaxWidthWrapper}>
      <GoBackHeader title="Створення команди" />
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <h1 className={styles.ContentTitle}>Створення команди</h1>
          <span className={styles.Label}>Обкладинка</span>
          <div className={styles.UploadZone}>
            <UploadCloud size={20} />
            <span>Завантажте</span>
            <span>фото</span>
            <svg
              className={styles.UploadZoneBorder}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect className={styles.Rectangle} />
            </svg>
          </div>
        </div>
        <footer className={styles.FooterMenu}>
          <Button>Створити</Button>
          <Button>Очистити</Button>
        </footer>
      </div>
    </div>
  )
}
