import { ArrowLeft } from 'lucide-react'
import styles from './GoBackHeader.module.scss'
import { Button } from '@base-ui/react'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import ClickTargetHelper from '../ClickTargetHelper'

interface GoBackHeaderProps {
  title: string
}

function GoBackHeader({ title }: GoBackHeaderProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ to: '/' })
    }
  }
  return (
    <div className={styles.GoBackHeader}>
      <Button onClick={handleBack} className={styles.BackButton}>
        <ClickTargetHelper />
        <ArrowLeft size={20} />
      </Button>
      <h1 className={styles.Header}>{title}</h1>
    </div>
  )
}

export default GoBackHeader
