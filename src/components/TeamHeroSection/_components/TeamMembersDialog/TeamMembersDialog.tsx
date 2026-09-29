import { Button, Dialog, ScrollArea } from '@base-ui/react'
import { InfoIcon, XIcon } from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'
import { useMediaQuery } from '@/hooks/use-media-query'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import MotionButton from '@/components/MotionButton'
import { MemberItem } from '..'
import { Masonry } from 'react-plock'
import { useQuery } from '@tanstack/react-query'
import { teamsQueries } from '@/services/queries'
import { getRouteApi } from '@tanstack/react-router'
import clsx from 'clsx'
import { useHelperDialog } from '@/hooks/use-helper-dialog'
import HelperDialog from '@/components/HelperDialog'
import styles from './TeamMembersDialog.module.scss'

interface TeamInfoDialogProps {
  isOpen: boolean
  onIsOpenChange: (open: boolean) => void
}

const routeApi = getRouteApi('/team/$id/')

export function TeamMembersDialog({
  isOpen,
  onIsOpenChange,
}: TeamInfoDialogProps) {
  const { id } = routeApi.useParams()
  const loaderData = routeApi.useLoaderData()
  const { data, isPending, isError, refetch } = useQuery(
    teamsQueries.getTeamMembers(id),
  )
  const matches = useMediaQuery('(pointer: fine)')

  const helper = useHelperDialog(undefined, loaderData)

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.DialogBackdrop} />
        <Dialog.Viewport className={styles.DialogViewport}>
          <Dialog.Popup
            className={styles.DialogPopup}
            initialFocus={matches}
            data-loading={isPending ? '' : undefined}
            data-error={isError ? '' : undefined}
          >
            <div className={styles.DialogHeader}>
              <Dialog.Title className={styles.DialogTitle}>
                Учасники команди
              </Dialog.Title>
              {helper && (
                <HelperDialog
                  title={helper.title}
                  content={helper.content}
                  mdast={helper.mdast}
                  open={helper.isHelperOpen}
                  onOpenChange={helper.handleHelperOpenChange}
                  trigger={(openDialog) => (
                    <Button onClick={openDialog} className={styles.InfoButton}>
                      <InfoIcon size={18} />
                      <ClickTargetHelper />
                      <VisuallyHidden>Пояснення ролей</VisuallyHidden>
                    </Button>
                  )}
                />
              )}
              <Dialog.Description>
                <VisuallyHidden>
                  Детальний перелік усіх учасників команд та їх ролі
                </VisuallyHidden>
              </Dialog.Description>
              <Dialog.Close className={styles.DialogClose}>
                <XIcon size={18} />
                <ClickTargetHelper />
                <VisuallyHidden>Закрити вікно</VisuallyHidden>
              </Dialog.Close>
            </div>
            <ScrollArea.Root className={styles.BodyRoot}>
              <ScrollArea.Viewport className={styles.BodyViewport}>
                <ScrollArea.Content className={styles.BodyContent}>
                  {isPending ? (
                    <div className={styles.Loader} />
                  ) : isError ? (
                    <>
                      <p className={styles.Error}>Помилка завантаження даних</p>
                      <MotionButton
                        className={clsx(styles.RetryButton, 'Gradient')}
                        onClick={() => refetch()}
                      >
                        Спробувати знову
                      </MotionButton>
                    </>
                  ) : (
                    <Masonry
                      items={data}
                      config={{
                        columns: [1, 2],
                        media: [540, 540],
                        gap: [10, 14],
                      }}
                      render={(m) => <MemberItem member={m} key={m.id} />}
                      className={styles.MembersList}
                    />
                  )}
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className={styles.BodyScrollbar}>
                <ScrollArea.Thumb className={styles.BodyScrollbarThumb} />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
