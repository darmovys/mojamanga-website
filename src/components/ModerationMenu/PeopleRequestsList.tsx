import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import styles from './PeopleRequestsList.module.scss'
import MotionButton from '../MotionButton'
import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@base-ui/react'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingPerson, peopleQueries } from '@/services/queries'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

export default function PeopleRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(peopleQueries.pendingPeople(currentPage))

  const { people: currentItems, total: totalItems, totalPages } = data

  const [pageValue, setPageValue] = useState('')

  const handleJumpToPage = () => {
    const p = Number(pageValue)
    if (p >= 1 && p <= totalPages) {
      navigate({
        to: '/moderation',
        search: (prev) =>
          produce(prev as ModerationMenuSearch, (draft) => {
            if (p === 1) {
              delete draft.page
            } else {
              draft.page = p
            }
          }),
        replace: true,
      })
      setPageValue('')
    }
  }

  let startPage = Math.max(1, currentPage - 1)
  let endPage = Math.min(totalPages, startPage + 2)

  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2)
  }

  const consecutivePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  )

  const isFirstPageReachable = startPage === 1

  console.log('Загальна кількість сторінок: ', totalPages) // виводить 1
  console.log('Загальна кількість запитів: ', totalItems) // виводить 1
  console.log('current Items: ', currentItems) // виводить масив з першими 10 запитами

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

      {totalPages > 1 && (
        <div className={styles.PaginationSection}>
          <div className={styles.PageControls}>
            {/* Кнопка "На самий початок" */}
            {isFirstPageReachable ? (
              <Button className={clsx(styles.PageButton, styles.Disabled)}>
                <ChevronsLeft />
                <VisuallyHidden>Ви вже на початку</VisuallyHidden>
              </Button>
            ) : (
              <MotionButton
                render={
                  <Link
                    to="/moderation"
                    replace={true}
                    search={(prev) =>
                      produce(prev as ModerationMenuSearch, (draft) => {
                        delete draft.page
                      })
                    }
                  />
                }
                className={clsx(styles.PageButton, 'Gradient')}
              >
                <ChevronsLeft />
                <VisuallyHidden>Повернутися на самий початок</VisuallyHidden>
              </MotionButton>
            )}

            {/* Кнопка "Попередня" */}
            {currentPage === 1 ? (
              <Button className={clsx(styles.PageButton, styles.Disabled)}>
                <ChevronLeft />
              </Button>
            ) : (
              <MotionButton
                render={
                  <Link
                    to="/moderation"
                    replace={true}
                    search={(prev) =>
                      produce(prev as ModerationMenuSearch, (draft) => {
                        const target = currentPage - 1
                        if (target === 1) delete draft.page
                        else draft.page = target
                      })
                    }
                  />
                }
                className={clsx(styles.PageButton, 'Gradient')}
              >
                <ChevronLeft />
              </MotionButton>
            )}

            {/* ТРИ ПОСЛІДОВНІ СТОРІНКИ */}
            {consecutivePages.map((p) => (
              <MotionButton
                key={p}
                render={
                  <Link
                    to="/moderation"
                    replace={true}
                    search={(prev) =>
                      produce(prev as ModerationMenuSearch, (draft) => {
                        if (p === 1) delete draft.page
                        else draft.page = p
                      })
                    }
                  />
                }
                className={clsx(styles.PageButton, 'Gradient', {
                  [styles.Active]: currentPage === p,
                })}
              >
                {p}
              </MotionButton>
            ))}

            {/* Трикрапка */}
            {endPage < totalPages - 1 && (
              <div className={styles.PagesDivider}>...</div>
            )}

            {/* Остання сторінка */}
            {endPage < totalPages && (
              <MotionButton
                render={
                  <Link
                    to="/moderation"
                    replace={true}
                    search={(prev) =>
                      produce(prev as ModerationMenuSearch, (draft) => {
                        draft.page = totalPages
                      })
                    }
                  />
                }
                className={clsx(styles.PageButton, 'Gradient', {
                  [styles.Active]: currentPage === totalPages,
                })}
              >
                {totalPages}
              </MotionButton>
            )}

            {/* Кнопка "Наступна" */}
            {currentPage === totalPages ? (
              <Button className={clsx(styles.PageButton, styles.Disabled)}>
                <ChevronRight />
              </Button>
            ) : (
              <MotionButton
                render={
                  <Link
                    to="/moderation"
                    replace={true}
                    search={(prev) =>
                      produce(prev as ModerationMenuSearch, (draft) => {
                        draft.page = currentPage + 1
                      })
                    }
                  />
                }
                className={clsx(styles.PageButton, 'Gradient')}
              >
                <ChevronRight />
              </MotionButton>
            )}
          </div>

          <div className={styles.GoToSpecificPage}>
            <span>Перейти до:</span>
            <input
              className={styles.PageInput}
              value={pageValue}
              inputMode="numeric"
              onChange={(e) => setPageValue(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
            />
          </div>
        </div>
      )}
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
              <span>Запит від: {person.suggestedByUser?.displayUsername}</span>
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
