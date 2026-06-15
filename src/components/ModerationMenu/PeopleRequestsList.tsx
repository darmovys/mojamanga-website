import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import styles from './PeopleRequestsList.module.scss'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingPerson, peopleQueries } from '@/services/queries'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import Pagination from '../Pagination'

export default function PeopleRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(peopleQueries.pendingPeople(currentPage))

  const { people: currentItems, total: totalItems, totalPages } = data

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
        Запити на додавання персон ({totalItems})
      </h2>
      <div className={styles.List}>
        {currentItems.length > 0 ? (
          currentItems.map((person) => (
            <PersonRequestCard key={person.id} person={person} />
          ))
        ) : (
          <p className={styles.EmptyList}>Усі запити розглянуті 👍</p>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className={styles.PeopleListPagination}
      />
    </div>
  )
}

function PersonRequestCard({ person }: { person: PendingPerson }) {
  const formattedDate = formatDistanceToNow(new Date(person.createdAt), {
    locale: uk,
    addSuffix: true,
  })

  return (
    <Link
      aria-labelledby={person.id}
      className={styles.Link}
      to="/moderation/person-review/$personId"
      params={{ personId: person.id }}
    >
      <article className={styles.Card}>
        <div className={styles.Content}>
          <header className={styles.Header}>
            <h3 id={person.id} className={styles.PersonName}>
              {person.nameUkr}
            </h3>
            <div className={styles.MetaInfo}>
              <span>Запит від: {person.proposedByUser?.displayUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{formattedDate}</span>
            </div>
          </header>
          <p className={styles.Description}>
            {person.description || 'Опис відсутній'}
          </p>
        </div>
      </article>
    </Link>
  )
}

export function PeopleRequestsSkeleton() {
  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>Заявки на додавання персон (?)</h2>
      <div className={styles.List} style={{ alignSelf: 'stretch' }}>
        {range(10).map((el) => (
          <Skeleton key={el} height="135px" width="100%" borderRadius="12px" />
        ))}
      </div>
    </div>
  )
}
