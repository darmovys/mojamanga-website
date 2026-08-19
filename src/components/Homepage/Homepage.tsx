import GlobalSearchSection from '../GlobalSearchSection'
import HeroCarousel from '../HeroCarousel'
import MobileNavigation from '../MobileNavigation'
import TitlesUpdates from '../TitlesUpdates'
import styles from './Homepage.module.scss'

function Homepage() {
  return (
    <>
      <GlobalSearchSection isHiddenOnMobile={false} />
      <div className={styles.Wrapper}>
        <HeroCarousel />
        <TitlesUpdates />
      </div>
      <MobileNavigation />
    </>
  )
}

export default Homepage
