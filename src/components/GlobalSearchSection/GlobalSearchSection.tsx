import SearchContentField from '../SearchContentField'
import styles from './GlobalSearchSection.module.scss'
import useSectionVisibility from './use-scroll-hiding-content'

export default function GlobalSearchSection() {
  const { isContentVisible } = useSectionVisibility()

  const transform = isContentVisible ? 'translateY(0)' : 'translateY(-100%)'

  return (
    <div style={{ transform }} className={styles.Wrapper}>
      <SearchContentField />
    </div>
  )
}
