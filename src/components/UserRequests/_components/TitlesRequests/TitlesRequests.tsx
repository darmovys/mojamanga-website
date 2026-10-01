import { Tabs } from '..'
import { getRouteApi, Link } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { usersQueries } from '@/services/queries'
import { TitleApprovalStatus } from '@/generated/prisma/enums'
import { useState, useTransition } from 'react'
import { Image } from '@unpic/react'

import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { ImageOffIcon, SquarePenIcon, XIcon } from 'lucide-react'
import MotionButton from '@/components/MotionButton'
import clsx from 'clsx'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import ConfirmDialog from '@/components/ConfirmDialog'
import Skeleton from '@/components/Skeleton'
import { range } from '@/lib/utils'
import styles from './TitlesRequests.module.scss'

const routeApi = getRouteApi('/user/$id_/requests/titles')

export function TitlesRequests() {
  const { id } = routeApi.useParams()
  const { status } = routeApi.useSearch()
  const { data } = useSuspenseQuery(
    usersQueries.getUserTitlesRequests(id, status),
  )

  return (
    <>
      <Tabs name="Твори" route="titles" />
      <main
        className={styles.MainSection}
        data-empty={data.length > 0 ? undefined : ''}
      >
        {data.length > 0 ? (
          data.map(({ id, coverUrl, name, status }) => (
            <TitleCard
              key={id}
              titleId={id}
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

interface TitleCardProps {
  titleId: string
  coverUrl: string | null
  status: TitleApprovalStatus
  name: string
}

function TitleCard({ coverUrl, name, status, titleId }: TitleCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const queryClient = useQueryClient()

  function deleteTitle() {
    if (isDeleting) return
    startTransition(async () => {
      const { error, data } = await api().titles({ id: titleId }).delete()
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
              title: 'Помилка',
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

      await queryClient.invalidateQueries({
        queryKey: usersQueries.getUserTitlesRequests(data.userId, 'rejected')
          .queryKey,
      })
    })
  }

  return (
    <div
      className={styles.CardWrapper}
      data-is-deleting={isDeleting ? '' : undefined}
    >
      <div
        className={styles.ImageWrapper}
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
            render={<Link to="/title/$id/revise" params={{ id: titleId }} />}
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
              deleteTitle()
            }}
          />
        </div>
      )}
      <span className={styles.ItemName}>
        {status !== 'PENDING' && status !== 'REJECTED' ? (
          <Link
            className={styles.ItemLink}
            to="/title/$id"
            params={{ id: titleId }}
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

export function TitlesRequestsSkeleton() {
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
        className={styles.MainSkeletonSection}
        data-rejected={status === 'rejected' ? '' : undefined}
      >
        {range(5).map((index) => (
          <div key={index}>
            <div className={styles.CardSkeletonItem}>
              <Skeleton
                className={styles.CardSkeletonItemImage}
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
