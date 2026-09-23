import { Button } from '@base-ui/react'
import TeamHeroSection from '../TeamHeroSection'
import styles from './TeamProfile.module.scss'
import ClickTargetHelper from '../ClickTargetHelper'
import { ArrowLeft } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { useGoBack } from '@/hooks/use-go-back'
import TeamMainSection from '../TeamMainSection'

function TeamProfile() {
  const { handleGoBack } = useGoBack()

  return (
    <>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Профіль команди</h1>
      </div>
      <TeamHeroSection />
      <TeamMainSection />
    </>
  )
}

export default TeamProfile
