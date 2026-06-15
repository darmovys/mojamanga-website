import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import styles from './TeamsRequestsList.module.scss'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingTeam, teamsQueries } from '@/services/queries'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import Pagination from '../Pagination'

export default function TeamsRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(teamsQueries.pendingTeams(currentPage))

  const { teams: currentItems, total: totalItems, totalPages } = data

  const handlePageChange = (page: number) => {
    navigate({
      to: '/moderation',
      search: (prev) =>
        produce(prev as ModerationMenuSearch, (draft) => {
          if (page === 1) {
            delete draft.page
          } else {
            draft.page = page
          }
        }),
      replace: true,
    })
  }

  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>
        Запити на створення команди ({totalItems})
      </h2>
      <div className={styles.List}>
        {currentItems.length > 0 ? (
          currentItems.map((team) => (
            <TeamRequestCard key={team.id} team={team} />
          ))
        ) : (
          <p className={styles.EmptyList}>Усі запити розглянуті 👍</p>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className={styles.TeamsListPagination}
      />
    </div>
  )
}

function TeamRequestCard({ team }: { team: PendingTeam }) {
  const formattedDate = formatDistanceToNow(new Date(team.createdAt), {
    locale: uk,
    addSuffix: true,
  })

  return (
    <Link
      aria-labelledby={team.id}
      className={styles.Link}
      to="/moderation/team-review/$teamId"
      params={{ teamId: team.id }}
    >
      <article className={styles.Card}>
        <div className={styles.Content}>
          <header className={styles.Header}>
            <h3 id={team.id} className={styles.TeamName}>
              {team.name}
            </h3>
            <div className={styles.MetaInfo}>
              <span>Запит від: {team.creator.displayUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{formattedDate}</span>
            </div>
          </header>
          <p className={styles.Description}>
            {team.description || 'Опис відсутній'}
          </p>
        </div>
      </article>
    </Link>
  )
}

export function TeamsRequestsSkeleton() {
  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>Заявки команд (?)</h2>
      <div className={styles.List} style={{ alignSelf: 'stretch' }}>
        {range(10).map((el) => (
          <Skeleton key={el} height="135px" width="100%" borderRadius="12px" />
        ))}
      </div>
    </div>
  )
}
