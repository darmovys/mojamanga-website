import { useSuspenseQuery } from '@tanstack/react-query'
import { usersQueries } from '@/services/queries'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { ImageOffIcon } from 'lucide-react'
import ClickTargetHelper from '../ClickTargetHelper'
import { motion } from 'motion/react'
import { range } from '@/lib/utils'
import Skeleton from '../Skeleton'
import styles from './TeamsSection.module.scss'

const routeApi = getRouteApi('/user/$id')

function TeamsSection() {
  const { id: userId } = routeApi.useParams()
  const { data: teams } = useSuspenseQuery(usersQueries.getUserTeams(userId))
  return (
    <main className={styles.Main}>
      <h2 className={styles.SectionHeading}>Членства в командах</h2>
      {teams.length > 0 ? (
        <ul className={styles.TeamsList}>
          {teams.map(({ id: teamId, name, coverUrl, status }) => (
            <li className={styles.TeamItem} key={teamId}>
              <div className={styles.ImageWrapper} data-no-image={!coverUrl}>
                {coverUrl ? (
                  <Image
                    className={styles.TeamCover}
                    src={import.meta.env.VITE_STORAGE_URL + coverUrl}
                    layout="fullWidth"
                  />
                ) : (
                  <div className={styles.NoImage}>
                    <ImageOffIcon size={20} />
                    <span>Обкладинки</span>
                    <span>немає</span>
                  </div>
                )}
                {status === 'PENDING' && (
                  <div className={styles.StatusCover}>Проходить перевірку</div>
                )}
                {status === 'REJECTED' && (
                  <div className={styles.StatusRejectedCover}>
                    <span>Відхилено</span>
                    <Link
                      to="/user/$id/revise-team/$teamId"
                      params={{ id: userId, teamId }}
                      className={styles.ReviseButton}
                    >
                      <motion.span
                        initial={{ fontWeight: 400 }}
                        whileHover={{ fontWeight: 500 }}
                        transition={{
                          type: 'spring',
                          duration: 0.3,
                          bounce: 0,
                        }}
                      >
                        <ClickTargetHelper />
                        Переробити
                      </motion.span>
                    </Link>
                  </div>
                )}
              </div>

              <div className={styles.TeamName}>
                {status !== 'PENDING' && status !== 'REJECTED' ? (
                  <Link
                    className={styles.TeamNameLink}
                    to="/team/$id"
                    params={{ id: teamId }}
                  >
                    <ClickTargetHelper />
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span className={styles.NoTeam}>
          Користувач не перебуває в жодній команді
        </span>
      )}
    </main>
  )
}

export function TeamsSectionSkeleton() {
  return (
    <main className={styles.Main}>
      <h2 className={styles.SectionHeading}>Членства в командах</h2>
      <ul className={styles.TeamsList}>
        {range(4).map((index) => (
          <li className={styles.TeamItem} key={index}>
            <Skeleton
              width="100%"
              height="15.625rem"
              borderRadius="var(--6px)"
            />
            <Skeleton width="100%" height="3.25rem" borderRadius="var(--6px)" />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default TeamsSection
