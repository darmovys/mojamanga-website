import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { usersQueries } from '@/services/queries'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { ImageOffIcon, SquarePenIcon, XIcon } from 'lucide-react'
import ClickTargetHelper from '../ClickTargetHelper'
import { range } from '@/lib/utils'
import Skeleton from '../Skeleton'
import MotionButton from '../MotionButton'
import ConfirmDialog from '../ConfirmDialog'
import { TeamStatus } from '@/generated/prisma/enums'
import { useState, useTransition } from 'react'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import styles from './TeamsSection.module.scss'

const routeApi = getRouteApi('/user/$id/teams')

function TeamsSection() {
  const { id: userId } = routeApi.useParams()
  const { data: teams } = useSuspenseQuery(usersQueries.getUserTeams(userId))
  return (
    <main className={styles.Main}>
      <h2 className={styles.SectionHeading}>Членства в командах</h2>
      {teams.length > 0 ? (
        <ul className={styles.TeamsList}>
          {teams.map(({ id: teamId, name, coverUrl, status }) => (
            <TeamCard
              key={teamId}
              teamId={teamId}
              name={name}
              coverUrl={coverUrl}
              status={status}
            />
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

interface TeamCardProps {
  teamId: string
  coverUrl: string | null
  status: TeamStatus
  name: string
}

function TeamCard({ teamId, coverUrl, status, name }: TeamCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const queryClient = useQueryClient()
  function deleteTeam() {
    if (isDeleting) return
    startTransition(async () => {
      const { error, data } = await api().teams({ id: teamId }).delete()
      if (error) {
        if (error.status === 422) {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description: error.value.message ?? 'Помилка валідації',
            },
            4000,
          )
        } else if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 403 || error.status === 404) {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description: error.value,
            },
            4000,
          )
        } else {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value,
            },
            4000,
          )
        }
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: usersQueries.getUserTeams(data.userId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: usersQueries.getUserTeamsRequests(data.userId, 'rejected')
            .queryKey,
        }),
      ])
    })
  }
  return (
    <li
      className={styles.TeamItem}
      data-is-deleting={isDeleting ? '' : undefined}
    >
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
            <div className={styles.ButtonsWrapper}>
              <MotionButton
                nativeButton={false}
                disabled={isDeleting}
                render={<Link to="/team/$id/edit" params={{ id: teamId }} />}
                className={styles.ReviseButton}
              >
                <ClickTargetHelper />
                <SquarePenIcon size={14} />
                Переробити
              </MotionButton>
              <MotionButton
                onClick={() => setIsDialogOpen(!isDialogOpen)}
                disabled={isDeleting}
                className={styles.DeleteButton}
              >
                <ClickTargetHelper />
                <XIcon size={16} />
                Видалити
              </MotionButton>
              <ConfirmDialog
                isOpen={isDialogOpen}
                onIsOpenChange={setIsDialogOpen}
                description="Ви точно хочете видалити цей запит?"
                onConfirm={() => {
                  setIsDialogOpen(false)
                  if (isDeleting) return
                  deleteTeam()
                }}
              />
            </div>
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
