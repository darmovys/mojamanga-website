import GlobalSearchSection from '../GlobalSearchSection'
import HeroCarousel from '../HeroCarousel'
import MobileNavigation from '../MobileNavigation'

function Homepage() {
  return (
    <>
      <GlobalSearchSection isHiddenOnMobile={false} />
      <HeroCarousel />
      <MobileNavigation />
    </>
  )
}

export default Homepage
