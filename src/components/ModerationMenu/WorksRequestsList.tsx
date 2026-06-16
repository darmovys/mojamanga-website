import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import styles from './WorksRequestsList.module.scss'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingWork, worksQueries } from '@/services/queries'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import Pagination from '../Pagination'

export default function WorksRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(worksQueries.pendingWorks(currentPage))

  const { works: currentItems, total: totalItems, totalPages } = data

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
        Запити на додавання творів ({totalItems})
      </h2>
      <div className={styles.List}>
        {currentItems.length > 0 ? (
          currentItems.map((work) => (
            <PersonRequestCard key={work.id} work={work} />
          ))
        ) : (
          <p className={styles.EmptyList}>Усі запити розглянуті 👍</p>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className={styles.WorksListPagination}
      />
    </div>
  )
}

function PersonRequestCard({ work }: { work: PendingWork }) {
  const formattedDate = formatDistanceToNow(new Date(work.createdAt), {
    locale: uk,
    addSuffix: true,
  })

  /*
    currentVersion теоретично може бути null згідно з типами Prisma,
    оскільки вона не вміє звужувати типи на основі параметрів запиту.
    На практиці це поле завжди присутнє — ми створюємо його одразу після створення твору.
    В ідеалі цей рядок ніколи не виконається.
  */
  if (!work.currentVersion) return null

  return (
    <Link
      aria-labelledby={work.id}
      className={styles.Link}
      to="/moderation/work-review/$workId"
      params={{ workId: work.id }}
    >
      <article className={styles.Card}>
        <div className={styles.Content}>
          <header className={styles.Header}>
            <h3 id={work.id} className={styles.PersonName}>
              {work.currentVersion.nameUkr}
            </h3>
            <div className={styles.MetaInfo}>
              <span>Запит від: {work.proposedByUser.displayUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{formattedDate}</span>
            </div>
          </header>
          <p className={styles.Description}>
            {work.currentVersion?.description || 'Опис відсутній'}
          </p>
        </div>
      </article>
    </Link>
  )
}

export function WorksRequestsSkeleton() {
  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>Запити на додавання творів (?)</h2>
      <div className={styles.List} style={{ alignSelf: 'stretch' }}>
        {range(10).map((el) => (
          <Skeleton key={el} height="135px" width="100%" borderRadius="12px" />
        ))}
      </div>
    </div>
  )
}
