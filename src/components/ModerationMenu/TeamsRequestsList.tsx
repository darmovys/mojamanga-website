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

// Мокові дані на основі вашої schema.prisma
const MOCK_TEAM_REQUESTS = [
  {
    id: 'cuid1',
    name: 'Dark Scans UA',
    description:
      'Команда перекладачів, що спеціалізується на темних фентезі тайтлах. Досвід перекладу 3 роки. Працюємо швидко та якісно. Шукаємо нові проекти для перекладу та розширення аудиторії.',
    creatorUsername: 'darkreader',
    createdAt: '35 хв тому',
  },
  {
    id: 'cuid2',
    name: 'Sakura Squad',
    description:
      'Молода команда з великим ентузіазмом. Перекладаємо романтичні манґи та сьодзьо. Маємо досвідченого редактора та двох тайпсетерів. Відкриті до співпраці з новими скенерами.',
    creatorUsername: 'sakura_hime',
    createdAt: '1 год тому',
  },
  {
    id: 'cuid3',
    name: 'Iron Fansub',
    description:
      'Спеціалізуємось на бойових манґах та ісекаї. Команда з 5 осіб із досвідом понад 4 роки. Гарантуємо стабільні релізи щотижня. Шукаємо клінера та додаткового перекладача.',
    creatorUsername: 'iron_tl',
    createdAt: '3 год тому',
  },
  {
    id: 'cuid4',
    name: 'MoonLight Translate',
    description:
      'Перекладаємо manhwa та маньхуа українською. Є досвід роботи з веб-тунами та вертикальними форматами. Команда активна та відповідальна. Розглядаємо пропозиції щодо нових тайтлів.',
    creatorUsername: 'moonlight_ua',
    createdAt: '5 год тому',
  },
  {
    id: 'cuid5',
    name: 'Crimson Pages',
    description:
      'Невелика, але згуртована команда. Фокус на жанрах жахів та психологічних триллерах. Досвід — 2 роки. Маємо власний сайт для публікацій. Запрошуємо редактора до складу.',
    creatorUsername: 'crimson_edit',
    createdAt: '8 год тому',
  },
  {
    id: 'cuid6',
    name: 'UkrOtaku Studio',
    description:
      'Один з найстаріших україномовних скен-гуртів. Перекладаємо популярні шонен тайтли з 2019 року. Маємо налагоджений процес та великий досвід. Шукаємо нового тайпсетера.',
    creatorUsername: 'otaku_lead',
    createdAt: '1 день тому',
  },
  {
    id: 'cuid7',
    name: 'Neon Scanlation',
    description:
      'Команда для тих, хто любить кіберпанк та наукову фантастику. Перекладаємо нішеві тайтли, що рідко отримують переклад. Шукаємо людей із нестандартним смаком і відповідальним підходом.',
    creatorUsername: 'neon_cyber',
    createdAt: '2 дні тому',
  },
  {
    id: 'cuid8',
    name: 'Petal Fansub',
    description:
      'Спеціалізуємося на josei та slice-of-life манґах. Приділяємо увагу деталям перекладу та природності мови. Команда з 3 перекладачів і 2 редакторів. Запрошуємо художнього редактора.',
    creatorUsername: 'petal_tl',
    createdAt: '2 дні тому',
  },
  {
    id: 'cuid9',
    name: 'Thunder Scan',
    description:
      'Динамічна команда з фокусом на спортивних манґах. Перекладаємо швидко — зазвичай протягом 48 годин після виходу глави. Маємо 1.5 роки досвіду та понад 200 виданих глав.',
    creatorUsername: 'thunder_sport',
    createdAt: '3 дні тому',
  },
  {
    id: 'cuid10',
    name: 'Void Translators',
    description:
      'Займаємося перекладом складних тайтлів із нестандартним наративом. Маємо філологічну освіту в команді. Не поспішаємо, але робимо якісно. Шукаємо клінера з досвідом у складних фонах.',
    creatorUsername: 'void_phil',
    createdAt: '4 дні тому',
  },
  {
    id: 'cuid11',
    name: 'Kyiv Manga Club',
    description:
      'Аматорська команда з Києва, яка переросла у серйозний проект. Перекладаємо різні жанри, але здебільшого сьонен та комедії. Відкриті до нових учасників без досвіду — навчимо.',
    creatorUsername: 'kyiv_manga',
    createdAt: '5 днів тому',
  },
  {
    id: 'cuid12',
    name: 'Silver Ink UA',
    description:
      'Команда з досвідом у літературному перекладі. Беремо лише якісні тайтли та працюємо без поспіху. Є досвід співпраці з офіційними видавництвами. Шукаємо другого перекладача з японської.',
    creatorUsername: 'silver_writer',
    createdAt: '1 тиж тому',
  },
]

const ITEMS_PER_PAGE = 10

export default function TeamsRequestsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    type?: string
  }
  const urlPage = Number(searchParams?.page)

  const totalItems = MOCK_TEAM_REQUESTS.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  let currentPage = !isNaN(urlPage) && urlPage > 0 ? urlPage : 1
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = MOCK_TEAM_REQUESTS.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

  const [pageValue, setPageValue] = useState('')

  const handleJumpToPage = () => {
    const p = Number(pageValue)
    if (p >= 1 && p <= totalPages) {
      navigate({
        to: '/moderation',
        search: (prev) =>
          produce(prev as ModerationMenuSearch, (draft) => {
            if (p === 1) {
              delete draft.page // Видаляємо параметр для першої сторінки
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
        {currentItems.map((team) => (
          <TeamRequestCard key={team.id} team={team as any} />
        ))}
      </div>

      {totalItems > ITEMS_PER_PAGE && (
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

function TeamRequestCard({ team }: { team: (typeof MOCK_TEAM_REQUESTS)[0] }) {
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
              <span>Засновник: @{team.creatorUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{team.createdAt}</span>
            </div>
          </header>
          <p className={styles.Description}>{team.description}</p>
        </div>
      </article>
    </Link>
  )
}
