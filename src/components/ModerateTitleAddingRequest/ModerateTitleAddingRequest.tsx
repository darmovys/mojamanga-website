import React, { useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { useGoBack } from '@/hooks/use-go-back'
import { Button, ScrollArea, Separator } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import { ArrowLeft, Check, Copy, ImageOff, Info, Link2Icon } from 'lucide-react'
import MotionButton from '../MotionButton'
import clsx from 'clsx'
import VisuallyHidden from '../VisuallyHidden'
import { Image } from '@unpic/react'
import {
  AGE_RESTRICTION_LABELS,
  TRANSLATION_STATUS_LABELS,
  TITLE_STATUS_LABELS,
  TITLE_TYPE_LABELS,
} from '@/lib/constants'
import { format } from 'date-fns'
import ShiftBy from '../ShiftBy'
import HelperDialog from '../HelperDialog'
import { useReviewRequest } from './use-review-request'
import Skeleton from '../Skeleton'
import ConfirmDialog from '../ConfirmDialog'
import { useHelperDialog } from '@/hooks/use-helper-dialog'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { AnimatePresence, motion } from 'motion/react'
import { isTrustedHostname, range } from '@/lib/utils'
import AwayDialog from '../AwayDialog'
import { TitleFieldName } from '@/generated/prisma/enums'
import LockedFiedlsCheckboxGroup from '../LockedFieldsCheckboxGroup'
import styles from './ModerateTitleAddingRequest.module.scss'

const routeApi = getRouteApi('/moderation/title-review/$titleId')

function ModerateTitleAddingRequest() {
  const { titleId } = routeApi.useParams()
  const loaderData = routeApi.useLoaderData()

  const { handleGoBack } = useGoBack()
  const helper = useHelperDialog(
    'seen_add_title_request_moderation_rules',
    loaderData,
  )

  const {
    data,
    isPending,
    handleApprove,
    handleRevise,
    handleDecline,
    approveMutation,
    reviseMutation,
    declineMutation,
    activeDialog,
    setActiveDialog,
    message,
    setMessage,
    serverLockedFields,
    lockedFields,
    setLockedFields,
  } = useReviewRequest(titleId)

  const currentVersionData = data.currentVersion

  let isPersonAuthorAndArtist = false

  const people = currentVersionData.people

  if (people.length === 2) {
    const roles = new Set(people.map((p) => p.role))
    const hasUniqueRoles = roles.size === 2

    if (hasUniqueRoles) {
      isPersonAuthorAndArtist = people[0].personId === people[1].personId
    }
  }

  const authors = people
    .filter((person) => person.role === 'AUTHOR')
    .map((author) => author.person.nameUkr)
  const artists = people
    .filter((person) => person.role === 'ARTIST')
    .map((artist) => artist.person.nameUkr)

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Розгляд нового твору</h1>
        {helper && (
          <HelperDialog
            title={helper.title}
            content={helper.content}
            mdast={helper.mdast}
            open={helper.isHelperOpen}
            onOpenChange={helper.handleHelperOpenChange}
            trigger={(openDialog) => (
              <Button onClick={openDialog} className={styles.InfoButton}>
                <ClickTargetHelper />
                <Info size={20} />
                <VisuallyHidden>Довідка</VisuallyHidden>
              </Button>
            )}
          />
        )}
      </div>
      <main className={styles.Content}>
        <div className={clsx(styles.Card, styles.NavCard)}>
          <ol className={styles.Breadcrumbs}>
            <li className={styles.Crumb}>
              <Link
                className={styles.Link}
                to="/moderation"
                search={{ type: 'titles' }}
                replace={true}
              >
                Запити на додавання нового твору
              </Link>
            </li>
            <li className={clsx(styles.Crumb, styles.Current)}>
              Розгляд нового твору
            </li>
          </ol>
          {helper && (
            <HelperDialog
              title={helper.title}
              content={helper.content}
              mdast={helper.mdast}
              open={helper.isHelperOpen}
              onOpenChange={helper.handleHelperOpenChange}
              trigger={(openDialog) => (
                <Button onClick={openDialog} className={styles.HelperButton}>
                  <Info size={16} />
                  <span>Довідка</span>
                </Button>
              )}
            />
          )}
        </div>
        <div className={clsx(styles.Card, styles.Creator)}>
          <div className={styles.UserInfo}>
            <span>Запит від</span>
            <Link
              to="/user/$id/bookmarks"
              params={{ id: data.proposedByUserId }}
              className={styles.CreatorLink}
            >
              <Image
                layout="fullWidth"
                src={
                  data.proposedByUser.image
                    ? import.meta.env.VITE_STORAGE_URL +
                      '' +
                      data.proposedByUser.image
                    : `https://api.dicebear.com/9.x/glass/svg?seed=${data.proposedByUser.displayUsername}`
                }
                className={styles.UserImage}
              />
              <span>{data.proposedByUser.displayUsername}</span>
            </Link>
          </div>

          <div className={styles.MetaInfo}>
            <span className={styles.Dot}>•</span>
            <ShiftBy y={1}>
              {format(data.updatedAt, 'dd.MM.yyyy HH:mm:ss')}
            </ShiftBy>
          </div>
        </div>

        <div className={styles.CardGroup}>
          <div className={clsx(styles.Card, styles.Cover)}>
            <div className={styles.ImageWrapper}>
              {currentVersionData.coverUrl ? (
                <Image
                  layout="fullWidth"
                  src={`${import.meta.env.VITE_STORAGE_URL}${currentVersionData.coverUrl}`}
                  alt="Обкладинка твору"
                  // className={styles.Image}
                  loading="lazy"
                />
              ) : (
                <div className={styles.NoImage} style={{ blockSize: '375px' }}>
                  <ImageOff size={24} />
                  <span>Не задано</span>
                </div>
              )}
              <h2 className={styles.ImageHeading}>Обкладинка</h2>
            </div>
          </div>
          <div className={clsx(styles.Card, styles.Background)}>
            <div className={styles.ImageWrapper}>
              {currentVersionData.backgroundUrl ? (
                <Image
                  layout="fullWidth"
                  src={`${import.meta.env.VITE_STORAGE_URL}${currentVersionData.backgroundUrl}`}
                  alt="Фонове зображення твору"
                  // className={styles.Image}
                  loading="lazy"
                />
              ) : (
                <div className={styles.NoImage} style={{ blockSize: '210px' }}>
                  <ImageOff size={24} />
                  <span>Не задано</span>
                </div>
              )}
              <h2 className={styles.ImageHeading}>Фонове зображення</h2>
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Meta)}>
            <h2 className={styles.MetaTitle}>Назва українською</h2>
            <div className={styles.MetaField}>{currentVersionData.nameUkr}</div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Назва англійською</h2>
            <div className={styles.MetaField}>{currentVersionData.nameEng}</div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Тип твору</h2>
            <div className={styles.MetaField}>
              <Link to="/catalog" className={styles.Link}>
                {TITLE_TYPE_LABELS[currentVersionData.type]}
              </Link>
            </div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Статус твору</h2>
            <div className={styles.MetaField}>
              <Link to="/catalog" className={styles.Link}>
                {TITLE_STATUS_LABELS[currentVersionData.titleStatus]}
              </Link>
            </div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Статус перекладу</h2>
            <div className={styles.MetaField}>
              <Link to="/catalog" className={styles.Link}>
                {
                  TRANSLATION_STATUS_LABELS[
                    currentVersionData.translationStatus
                  ]
                }
              </Link>
            </div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Вікові обмеження</h2>
            <div className={styles.MetaField}>
              <Link to="/catalog" className={styles.Link}>
                {AGE_RESTRICTION_LABELS[currentVersionData.ageRestriction]}
              </Link>
            </div>
            <Separator orientation="horizontal" className={styles.Separator} />
            <h2 className={styles.MetaTitle}>Рік випуску</h2>
            <div className={styles.MetaField}>
              <Link to="/catalog" className={styles.Link}>
                {currentVersionData.releaseYear}
              </Link>
            </div>
            <Separator orientation="horizontal" className={styles.Separator} />
            {isPersonAuthorAndArtist ? (
              <>
                <h2 className={styles.MetaTitle}>Автор і художник</h2>
                <div className={styles.MetaField}>
                  <Link to="/catalog" className={styles.Link}>
                    {currentVersionData.people[0].person.nameUkr}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.MetaTitle}>
                  {authors.length === 1 ? 'Автор' : 'Автори'}
                </h2>
                <div className={styles.MetaField}>
                  {authors.map((author, index, arr) => (
                    <React.Fragment key={index}>
                      <Link to="/catalog" className={styles.Link}>
                        {author}
                      </Link>
                      {index < arr.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </div>
                <Separator
                  orientation="horizontal"
                  className={styles.Separator}
                />
                <h2 className={styles.MetaTitle}>
                  {artists.length === 1 ? 'Художник' : 'Художники'}
                </h2>
                <div className={styles.MetaField}>
                  {artists.map((artist, index, arr) => (
                    <React.Fragment key={index}>
                      <Link to="/catalog" className={styles.Link}>
                        {artist}
                      </Link>
                      {index < arr.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
            {currentVersionData.alternativeNames.length > 0 && (
              <>
                <Separator
                  orientation="horizontal"
                  className={styles.Separator}
                />
                <h2 className={styles.MetaTitle}>Альтернативні назви</h2>
                <div className={clsx(styles.MetaField, styles.AltNamesGroup)}>
                  {currentVersionData.alternativeNames.map(({ id, name }) => (
                    <AltName key={id} name={name} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={clsx(styles.Card, styles.Description)}>
            <h2 className={styles.CardTitle}>Опис</h2>
            <div className={styles.TextField}>
              {currentVersionData.description ?? 'Опис не надано'}
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Genres)}>
            <h2 className={styles.CardTitle}>Жанри</h2>
            <div className={styles.LinksGroup}>
              {currentVersionData.genres.map(({ genre: { id, name } }) => (
                <Link to="/catalog" key={id} className={styles.ChipLink}>
                  <span className={styles.Chip}>{name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Tags)}>
            <h2 className={styles.CardTitle}>Теги</h2>
            <div className={styles.LinksGroup}>
              {currentVersionData.tags.map(({ tag: { id, name } }) => (
                <Link to="/catalog" key={id} className={styles.ChipLink}>
                  <span className={styles.Chip}># {name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.Card}>
          <h2 className={styles.CardTitle}>Команди</h2>
          <div className={styles.LinksGroup}>
            {data.publishers.map(({ team }, index, arr) => (
              <div key={team.id}>
                <Link
                  to="/team/$id"
                  params={{ id: team.id }}
                  className={styles.Link}
                >
                  <span>{team.name}</span>
                </Link>
                {index < arr.length - 1 ? ', ' : ''}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.Card}>
          <h2 className={styles.CardTitle}>Посилання на зовнішні ресурси</h2>
          <div className={styles.SourcesGroup}>
            {currentVersionData.sources.length > 0
              ? currentVersionData.sources.map((source) => (
                  <Source key={source.id} url={source.url} />
                ))
              : 'Відсутні'}
          </div>
        </div>

        <footer className={clsx(styles.Card, styles.Footer)}>
          <div className={styles.Actions}>
            <MotionButton
              className={clsx(styles.ApproveButton, 'Gradient', {
                [styles.Pending]: isPending,
              })}
              onClick={() => setActiveDialog('approve')}
              disabled={isPending}
            >
              {approveMutation.isPending ? 'Обробка...' : 'Схвалити'}
            </MotionButton>
            <ConfirmDialog
              description="Ви точно хочете схвалити запит?"
              isOpen={activeDialog === 'approve'}
              onIsOpenChange={(open) =>
                setActiveDialog(open ? 'approve' : null)
              }
              onConfirm={handleApprove}
            />
            <MotionButton
              className={clsx(styles.RejectButton, 'Gradient', {
                [styles.Pending]: isPending,
              })}
              onClick={() => setActiveDialog('revise')}
              disabled={isPending}
            >
              {reviseMutation.isPending ? 'Обробка...' : 'Доопрацювати'}
            </MotionButton>
            <ConfirmDialog
              description={
                'Виберіть всі поля, що пройшли перевірку. Вони будуть заблоковані для внесення змін'
              }
              isOpen={activeDialog === 'revise'}
              onIsOpenChange={(open) => {
                setActiveDialog(open ? 'revise' : null)
                if (!open) setLockedFields(serverLockedFields)
              }}
              onConfirm={handleRevise}
              children={
                <>
                  <ScrollArea.Root className={styles.ScrollArea}>
                    <ScrollArea.Viewport
                      className={styles.ScrollArea__Viewport}
                    >
                      <ScrollArea.Content
                        className={styles.ScrollArea__Content}
                      >
                        <LockedFiedlsCheckboxGroup
                          value={lockedFields}
                          onValueChange={(val) =>
                            setLockedFields(val as TitleFieldName[])
                          }
                          className={styles.CheckboxGroupWrapper}
                        />
                      </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                      className={styles.ScrollArea__Scrollbar}
                    >
                      <ScrollArea.Thumb className={styles.ScrollArea__Thumb} />
                    </ScrollArea.Scrollbar>
                  </ScrollArea.Root>

                  <textarea
                    name="message"
                    id="message"
                    placeholder="Опишіть причину (рекомендовано)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.MessageField}
                  />
                </>
              }
            />
            <MotionButton
              className={clsx(styles.HardRejectButton, {
                [styles.Pending]: isPending,
              })}
              onClick={() => setActiveDialog('decline')}
              disabled={isPending}
            >
              {declineMutation.isPending ? 'Обробка...' : 'Відхилити'}
            </MotionButton>
            <ConfirmDialog
              description={'Ви точно хочете відхилити запит?'}
              isOpen={activeDialog === 'decline'}
              onIsOpenChange={(open) =>
                setActiveDialog(open ? 'decline' : null)
              }
              onConfirm={handleDecline}
              children={
                <textarea
                  name="message"
                  id="message"
                  placeholder="Опишіть причину (рекомендовано)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.MessageField}
                />
              }
            />
          </div>
        </footer>
      </main>
    </div>
  )
}

interface SourceProps {
  url: string
}

function Source({ url }: SourceProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    <div className={styles.SourcesItem}>
      <MotionButton
        nativeButton={false}
        style={{ position: 'relative' }} // for click target helper
        render={
          <a
            className={styles.SourceLinkButton}
            href={url}
            onClick={openLink}
          />
        }
      >
        <Link2Icon size={16} />
        <VisuallyHidden>Перейти за посиланням {url}</VisuallyHidden>
        <ClickTargetHelper />
      </MotionButton>
      <AwayDialog
        url={url}
        isOpen={isDialogOpen}
        onIsOpenChange={setIsDialogOpen}
      />

      <div className={styles.Source}>{url}</div>
    </div>
  )
}

function AltName({ name }: { name: string }) {
  const { copy, isCopied } = useCopyToClipboard({
    resetIsCopiedStateAfter: 1000,
  })

  return (
    <div className={styles.AltName}>
      <span>{name}</span>
      <Button className={styles.CopyButton} onClick={() => copy(name)}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            style={{ position: 'relative' }} // for click-target cleper
            key={isCopied ? 'check' : 'copy'}
            initial={{
              opacity: 0,
              scale: 0.25,
              filter: 'blur(4px)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: 0.25,
              filter: 'blur(4px)',
            }}
            transition={{
              type: 'spring',
              duration: 0.3,
              bounce: 0,
            }}
          >
            {isCopied ? (
              <>
                <Check size={12} />
                <VisuallyHidden>Скопійовано</VisuallyHidden>
              </>
            ) : (
              <>
                <Copy size={12} />
                <VisuallyHidden>Скопіювати</VisuallyHidden>
              </>
            )}
            <ClickTargetHelper />
          </motion.div>
        </AnimatePresence>
      </Button>
    </div>
  )
}

export function ModerateTitleAddingRequestSkeleton() {
  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button className={styles.GoBackHeaderButton} disabled>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
        </Button>
        <h1 className={styles.GoBackHeading}>Розгляд нової команди</h1>
        <Button className={styles.InfoButton} disabled>
          <ClickTargetHelper />
          <Info size={20} />
        </Button>
      </div>

      <main className={styles.Content}>
        <div className={clsx(styles.Card, styles.NavCard)}>
          <ol className={styles.Breadcrumbs}>
            <li className={styles.Crumb}>
              <Link
                className={styles.Link}
                to="/moderation"
                search={{ type: 'titles' }}
              >
                Запити на додавання нового твору
              </Link>
            </li>
            <li className={clsx(styles.Crumb, styles.Current)}>
              Розгляд нового твору
            </li>
          </ol>
          <Button className={styles.HelperButton} disabled>
            <Info size={16} />
            <span>Довідка</span>
          </Button>
        </div>

        <div className={clsx(styles.Card, styles.Creator)}>
          <div className={styles.UserInfo}>
            <span>Запит від</span>
            <div className={styles.CreatorPlaceholder}>
              <Skeleton width="20px" height="20px" borderRadius="100vmax" />
              <Skeleton width="120px" height="16px" borderRadius="4px" />
            </div>
          </div>

          <div className={styles.MetaInfo}>
            <span className={styles.Dot}>•</span>
            <ShiftBy y={1}>
              <Skeleton width="140px" height="16px" borderRadius="4px" />
            </ShiftBy>
          </div>
        </div>

        <div className={styles.CardGroup}>
          <div className={clsx(styles.Card, styles.Cover)}>
            <div className={styles.ImageWrapper}>
              <Skeleton width="100%" height="358px" />
              <h2 className={styles.ImageHeading}>Обкладинка</h2>
            </div>
          </div>
          <div className={clsx(styles.Card, styles.Background)}>
            <div className={styles.ImageWrapper}>
              <Skeleton width="100%" height="155px" borderRadius="4px" />
              <h2 className={styles.ImageHeading}>Фонове зображення</h2>
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Meta)}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--6px)',
              }}
            >
              {range(6).map((id, _, arr) => (
                <React.Fragment key={id}>
                  <Skeleton width="100%" height="44px" borderRadius="4px" />
                  {id !== arr.length - 1 && (
                    <Separator
                      orientation="horizontal"
                      className={styles.Separator}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Description)}>
            <h2 className={styles.CardTitle}>Опис</h2>
            <div className={styles.DescriptionLines}>
              <Skeleton width="100%" height="16px" borderRadius="4px" />
              <Skeleton width="90%" height="16px" borderRadius="4px" />
              <Skeleton width="40%" height="16px" borderRadius="4px" />
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Genres)}>
            <h2 className={styles.CardTitle}>Жанри</h2>
            <div className={styles.LinksGroup}>
              {range(6).map((id) => {
                const randomWidth = Math.floor(Math.random() * 71) + 60
                return (
                  <Skeleton
                    key={id}
                    width={`${randomWidth}px`}
                    height="28px"
                    borderRadius="4px"
                  />
                )
              })}
            </div>
          </div>

          <div className={clsx(styles.Card, styles.Tags)}>
            <h2 className={styles.CardTitle}>Теги</h2>
            <div className={styles.LinksGroup}>
              {range(10).map((id) => {
                const randomWidth = Math.floor(Math.random() * 71) + 60
                return (
                  <Skeleton
                    key={id}
                    width={`${randomWidth}px`}
                    height="28px"
                    borderRadius="4px"
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.Card}>
          <h2 className={styles.CardTitle}>Команди</h2>
          <div className={styles.LinksGroup}>
            <Skeleton width="130px" height="16px" borderRadius="4px" />
          </div>
        </div>

        <div className={styles.Card} style={{ marginBlockEnd: 'var(--16px)' }}>
          <h2 className={styles.CardTitle}>Посилання на зовнішні ресурси</h2>
          <div className={styles.SourcesGroup}>
            {range(3).map((index) => (
              <div className={styles.SourcesItem} key={index}>
                <Skeleton
                  width="var(--32px)"
                  height="var(--32px)"
                  borderRadius="var(--6px)"
                />
                <Skeleton
                  width="100%"
                  height="var(--32px)"
                  borderRadius="var(--6px)"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ModerateTitleAddingRequest
