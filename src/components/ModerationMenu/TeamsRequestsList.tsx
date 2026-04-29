import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import styles from './TeamsRequestsList.module.scss'
import MotionButton from '../MotionButton'
import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@base-ui/react'
import { produce } from 'immer'
import { ModerationMenuSearch } from '@/schemas/moderation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PendingTeam, teamsQueries } from '@/services/queries'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

export default function TeamsRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }

  const currentPage = Number(searchParams?.page) || 1

  const { data } = useSuspenseQuery(teamsQueries.pendingTeams(currentPage))

  const { teams: currentItems, total: totalItems, totalPages } = data

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

  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>Заявки команд ({totalItems})</h2>
      <div className={styles.List}>
        {currentItems.length > 0 ? (
          currentItems.map((team) => (
            <TeamRequestCard key={team.id} team={team} />
          ))
        ) : (
          <p className={styles.EmptyList}>Усі заявки розглянуті 👍</p>
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
              <span>Засновник: @{team.creator.displayUsername}</span>
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
      <div className={styles.List}>
        {range(10).map((el) => (
          <Skeleton key={el} height="135px" width="100%" borderRadius="12px" />
        ))}
      </div>
    </div>
  )
}
