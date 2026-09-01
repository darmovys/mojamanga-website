import { Dialog, ScrollArea } from '@base-ui/react'
import { XIcon } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { useMediaQuery } from '@/hooks/use-media-query'
import ClickTargetHelper from '../ClickTargetHelper'
import Tooltip from '../Tooltip'
import ShiftBy from '../ShiftBy'
import { formatCompactNumber, isTrustedHostname, pluralize } from '@/lib/utils'
import { useState } from 'react'
import MotionButton, { tapAnimation } from '../MotionButton'
import { LinkType } from '@/generated/prisma/enums'
import AwayDialog from '../AwayDialog'
import { LINK_META } from '@/lib/constants'
import { AnimatePresence, motion, Variants } from 'motion/react'
import styles from './TeamHeroSection.module.scss'
import { useQuery } from '@tanstack/react-query'
import { TeamDetailedProfileData, teamsQueries } from '@/services/queries'
import { getRouteApi } from '@tanstack/react-router'
import clsx from 'clsx'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

interface TeamInfoDialogProps {
  isOpen: boolean
  onIsOpenChange: (open: boolean) => void
  name: string
}

const routeApi = getRouteApi('/team/$id/')

export function TeamInfoDialog({
  isOpen,
  onIsOpenChange,
  name,
}: TeamInfoDialogProps) {
  const { id } = routeApi.useParams()
  const { data, isPending, isError, refetch } = useQuery(
    teamsQueries.teamDetailedProfile(id),
  )
  const matches = useMediaQuery('(pointer: fine)')

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
              <Dialog.Title className={styles.DialogTitle}>{name}</Dialog.Title>
              <Dialog.Description>
                <VisuallyHidden>Детальна інформація про команду</VisuallyHidden>
              </Dialog.Description>
              <Dialog.Close className={styles.DialogClose}>
                <XIcon size={18} />
                <ClickTargetHelper />
              </Dialog.Close>
            </div>
            <ScrollArea.Root className={styles.BodyRoot}>
              <ScrollArea.Viewport className={styles.BodyViewport}>
                <ScrollArea.Content className={styles.BodyContent}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isPending ? (
                      <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={styles.Loader}
                      />
                    ) : isError ? (
                      <>
                        <p className={styles.Error}>
                          Помилка завантаження даних
                        </p>
                        <MotionButton
                          className={clsx(styles.RetryButton, 'Gradient')}
                          onClick={() => refetch()}
                        >
                          Спробувати знову
                        </MotionButton>
                      </>
                    ) : (
                      <TeamInfoContent data={data} />
                    )}
                  </AnimatePresence>
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

function TeamInfoContent({ data }: { data: TeamDetailedProfileData }) {
  const teamStats = [
    { count: data.totalTitles, words: ['твір', 'твори', 'творів'] },
    {
      count: data.totalMonthlyChapters,
      words: ['розділ/міс.', 'розділи/міс.', 'розділів/міс.'],
    },
    { count: data.totalMembers, words: ['учасник', 'учасники', 'учасників'] },
    { count: data.totalChapters, words: ['розділ', 'розділи', 'розділів'] },
  ]

  const contentVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 0.25 } },
    visible: { opacity: 1, transition: { duration: 0.25 } },
  }
  return (
    <>
      <motion.p
        key="content"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        {data.description}
      </motion.p>
      <motion.div
        key="content"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        className={styles.Statistics}
      >
        <h3>Статистика</h3>
        <ul className={styles.StatsList}>
          {teamStats.map((s, index) => {
            if (s.count === null) return undefined

            return (
              <li key={index} className={styles.Stat}>
                <SquareTextIcon size={20} />
                <strong className={styles.StatCount}>
                  {s.count >= 1000 ? (
                    <Tooltip
                      align="center"
                      className={styles.StatTooltip}
                      text={String(s.count)}
                    >
                      {formatCompactNumber(s.count)}
                    </Tooltip>
                  ) : (
                    formatCompactNumber(s.count)
                  )}
                </strong>{' '}
                <ShiftBy y={1.3}>{pluralize(s.count, s.words, true)}</ShiftBy>
              </li>
            )
          })}
        </ul>
      </motion.div>
      {data.links.length > 0 && (
        <motion.div
          key="content"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          className={styles.Links}
        >
          <h3 className={styles.LinksTitle}>Посилання</h3>
          <ul className={styles.LinksList}>
            {data.links.map((l) => (
              <li key={l.id}>
                <LinkItem type={l.type} url={l.url} />
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      <motion.div
        key="content"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        <h3>Дата створення</h3>
        <span>{format(data.createdAt, 'd MMM yyyy р.', { locale: uk })}</span>
      </motion.div>
    </>
  )
}

interface LinkItemProps {
  url: string
  type: LinkType
}

function LinkItem({ url, type }: LinkItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { icon: Icon, label } = LINK_META[type]

  const hostname = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  })()

  function openLink(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault()
    if (hostname && isTrustedHostname(hostname)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      setIsDialogOpen(true)
    }
  }

  return (
    <>
      <motion.a
        {...tapAnimation}
        className={styles.LinkItem}
        href={url}
        onClick={openLink}
      >
        <Icon className={styles.LinkLogo} />
        {label}
      </motion.a>
      <AwayDialog
        url={url}
        isOpen={isDialogOpen}
        onIsOpenChange={setIsDialogOpen}
      />
    </>
  )
}

function SquareTextIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 8h8" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </svg>
  )
}
