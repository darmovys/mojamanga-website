import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingTitle, titlesQueries } from '@/services/queries'
import Skeleton from '@/components/Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import Pagination from '@/components/Pagination'
import styles from './TitlesRequestsList.module.scss'

export function TitlesRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(titlesQueries.pendingTitles(currentPage))

  const { titles: currentItems, total: totalItems, totalPages } = data

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
          currentItems.map((title) => (
            <PersonRequestCard key={title.id} title={title} />
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

function PersonRequestCard({ title }: { title: PendingTitle }) {
  const formattedDate = formatDistanceToNow(new Date(title.updatedAt), {
    locale: uk,
    addSuffix: true,
  })

  /*
    currentVersion теоретично може бути null згідно з типами Prisma,
    оскільки вона не вміє звужувати типи на основі параметрів запиту.
    На практиці це поле завжди присутнє — ми створюємо його одразу після створення твору.
    В ідеалі цей рядок ніколи не виконається.
  */
  if (!title.currentVersion) return null

  return (
    <Link
      aria-labelledby={title.id}
      className={styles.Link}
      to="/moderation/title-review/$titleId"
      params={{ titleId: title.id }}
    >
      <article className={styles.Card}>
        <div className={styles.Content}>
          <header className={styles.Header}>
            <h3 id={title.id} className={styles.PersonName}>
              {title.currentVersion.nameUkr}
            </h3>
            <div className={styles.MetaInfo}>
              <span>Запит від: {title.proposedByUser.displayUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{formattedDate}</span>
            </div>
          </header>
          <p className={styles.Description}>
            {title.currentVersion?.description || 'Опис відсутній'}
          </p>
        </div>
      </article>
    </Link>
  )
}

export function TitlesRequestsSkeleton() {
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
