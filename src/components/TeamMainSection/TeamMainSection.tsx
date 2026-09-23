import TitleDefaultCard from '../TitleDefaultCard/TitleDefaultCard'
import { useSuspenseQuery } from '@tanstack/react-query'
import { teamsQueries } from '@/services/queries'
import { getRouteApi } from '@tanstack/react-router'
import styles from './TeamMainSection.module.scss'

const routeApi = getRouteApi('/team/$id/')

function TeamMainSection() {
  const { id } = routeApi.useParams()
  const { data } = useSuspenseQuery(teamsQueries.getTeamTitles(id))

  return (
    <main className={styles.Wrapper}>
      <h2 className={styles.Heading}>Переклади команди</h2>
      <div className={styles.Grid}>
        {data.map((title) => (
          <TitleDefaultCard
            key={title.id}
            coverUrl={title.currentVersion.coverUrl}
            titleId={title.id}
            type={title.currentVersion.type}
            name={title.currentVersion.nameUkr}
            bookmarkFolderData={title.bookmarkFolder}
          />
        ))}
      </div>
      {data.length === 0 && (
        <p className={styles.NoTitles}>
          Команда ще не перекладає жодного твору
        </p>
      )}
    </main>
  )
}

export default TeamMainSection
