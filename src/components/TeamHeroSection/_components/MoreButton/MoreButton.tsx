import { Button, Menu } from '@base-ui/react'
import {
  EllipsisIcon,
  InfoIcon,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  PencilIcon,
  UserPenIcon,
} from 'lucide-react'
import MotionButton from '@/components/MotionButton'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import { TeamRole } from '@/generated/prisma/enums'
import { useTransition } from 'react'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'
import { teamsQueries } from '@/services/queries'
import styles from './MoreButton.module.scss'

interface MoreButtonProps {
  size: number
  onOpenAbout?: () => void
  acceptsApplications: boolean
  currentUserRoles: TeamRole[] | null
  isMember: boolean
  teamId: string
}

export function MoreButton({
  size,
  onOpenAbout,
  acceptsApplications,
  currentUserRoles,
  isMember,
  teamId,
}: MoreButtonProps) {
  const [isProcessing, startTransition] = useTransition()
  const queryClient = useQueryClient()

  function handleApplicationsStateChange() {
    startTransition(async () => {
      const { error } = await api()
        .teams({ id: teamId })
        ['applications-state'].patch()

      if (error) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 422) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value.message,
            },
            4000,
          )
        } else if (error.status === 500) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value,
            },
            4000,
          )
        } else {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description: error.value,
            },
            4000,
          )
        }
        return
      }

      await queryClient.invalidateQueries({
        queryKey: teamsQueries.teamProfile(teamId).queryKey,
      })
    })
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <MotionButton className={styles.MoreButton}>
            <EllipsisIcon size={size} />
            <VisuallyHidden>Додаткові дії</VisuallyHidden>
            <ClickTargetHelper />
          </MotionButton>
        }
      />
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          className={styles.Positioner}
        >
          <Menu.Popup className={styles.Popup}>
            <Menu.Item
              className={styles.Item}
              nativeButton={true}
              onClick={onOpenAbout}
              render={<Button />}
            >
              <InfoIcon size={16} className={styles.icon} />
              <span className={styles.label}>Про команду</span>
            </Menu.Item>
            {isMember && (
              <>
                <Menu.Item className={styles.Item}>
                  <PencilIcon size={16} className={styles.icon} />
                  <span className={styles.label}>Редагування команди</span>
                </Menu.Item>
                <Menu.Item className={styles.Item}>
                  <UserPenIcon size={17} className={styles.icon} />
                  <span className={styles.label}>
                    Редагування прав учасників
                  </span>
                </Menu.Item>
              </>
            )}
            {currentUserRoles && currentUserRoles.includes(TeamRole.ADMIN) && (
              <Menu.Item
                className={styles.Item}
                nativeButton={true}
                render={<Button />}
                onClick={handleApplicationsStateChange}
                disabled={isProcessing}
                closeOnClick={false}
              >
                {acceptsApplications ? (
                  <>
                    <LockKeyholeIcon size={17} className={styles.icon} />
                    <span className={styles.label}>
                      Заборонити запити на вступ
                    </span>
                  </>
                ) : (
                  <>
                    <LockKeyholeOpenIcon size={17} className={styles.icon} />
                    <span className={styles.label}>
                      Дозволити запити на вступ
                    </span>
                  </>
                )}
              </Menu.Item>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
