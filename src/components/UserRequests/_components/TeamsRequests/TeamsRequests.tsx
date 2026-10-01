import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { usersQueries } from '@/services/queries'
import { Image } from '@unpic/react'
import { range } from '@/lib/utils'
import { ImageOffIcon, SquarePenIcon, XIcon } from 'lucide-react'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import clsx from 'clsx'
import MotionButton from '@/components/MotionButton'
import Skeleton from '@/components/Skeleton'
import { TeamStatus } from '@/generated/prisma/enums'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Tabs } from '..'
import styles from './TeamsRequests.module.scss'

const routeApi = getRouteApi('/user/$id_/requests/teams')

export function TeamsRequests() {
  const { id } = routeApi.useParams()
  const { status } = routeApi.useSearch()
  const { data } = useSuspenseQuery(
    usersQueries.getUserTeamsRequests(id, status),
  )
  return (
    <>
      <Tabs name="Команди" route="teams" />
      <main
        className={styles.MainSection}
        data-empty={data.length > 0 ? undefined : ''}
      >
        {data.length > 0 ? (
          data.map(({ id, coverUrl, name, status }) => (
            <TeamCard
              key={id}
              teamId={id}
              coverUrl={coverUrl}
              name={name}
              status={status}
            />
          ))
        ) : (
          <p className={styles.EmptyList}>Нічого не знайдено</p>
        )}
      </main>
    </>
  )
}

interface TeamCardProps {
  teamId: string
  coverUrl: string | null
  status: TeamStatus
  name: string
}

function TeamCard({ coverUrl, name, status, teamId }: TeamCardProps) {
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
    <div
      className={styles.CardWrapper}
      data-is-deleting={isDeleting ? '' : undefined}
    >
      <div
        className={styles.TeamImageWrapper}
        data-rejected={status === 'REJECTED' ? '' : undefined}
      >
        {coverUrl ? (
          <Image
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
      </div>
      {status === 'REJECTED' && (
        <div className={styles.ButtonsSection}>
          <MotionButton
            className={clsx(styles.ReviseButton, 'Gradient')}
            nativeButton={false}
            disabled={isDeleting}
            render={<Link to="/team/$id/edit" params={{ id: teamId }} />}
          >
            <SquarePenIcon size={14} />
            <ClickTargetHelper />
            Переробити
          </MotionButton>
          <MotionButton
            className={styles.DeleteButton}
            onClick={() => setIsDialogOpen(!isDialogOpen)}
            disabled={isDeleting}
          >
            <XIcon size={16} />
            <ClickTargetHelper />
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
      )}
      <span className={styles.ItemName}>
        {status !== 'PENDING' && status !== 'REJECTED' ? (
          <Link
            className={styles.ItemLink}
            to="/team/$id"
            params={{ id: teamId }}
          >
            {name}
            <ClickTargetHelper />
          </Link>
        ) : (
          name
        )}
      </span>
    </div>
  )
}

export function TeamsRequestsSkeleton() {
  const { status } = routeApi.useSearch()

  return (
    <div>
      <Skeleton
        width="var(--96px)"
        height="var(--28px)"
        style={{ marginBlockEnd: 'var(--6px)' }}
        borderRadius="var(--4px)"
      />

      <nav className={styles.TabsSkeleton}>
        {range(3).map((index) => (
          <Skeleton
            key={index}
            height="34px"
            width="100px"
            style={{ marginBlockEnd: '6px' }}
            borderRadius="var(--4px)"
          />
        ))}
      </nav>
      <main
        className={styles.MainTeamSkeletonSection}
        data-rejected={status === 'rejected' ? '' : undefined}
      >
        {range(5).map((index) => (
          <div key={index}>
            <div className={styles.CardSkeletonItem}>
              <Skeleton
                className={styles.TeamCardSkeletonItemImage}
                width="100%"
                height="100%"
                borderRadius="var(--4px)"
              />

              {status === 'rejected' &&
                range(2).map((index) => (
                  <Skeleton
                    key={index}
                    height="40px"
                    style={{ marginBlockStart: 'var(--2px)' }}
                    borderRadius="100vmax"
                  />
                ))}
              <Skeleton
                height="var(--64px)"
                style={{ marginBlockStart: 'var(--4px)' }}
                borderRadius="var(--2px)"
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
