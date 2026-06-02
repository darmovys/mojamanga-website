import { getRouteApi, Link } from '@tanstack/react-router'
import { useGoBack } from '@/hooks/use-go-back'
import { Button } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import { ArrowLeft, ImageOff, Info } from 'lucide-react'
import MotionButton from '../MotionButton'
import clsx from 'clsx'
import VisuallyHidden from '../VisuallyHidden'
import { Image } from '@unpic/react'
import { LINK_META } from '@/lib/constants'
import { useTheme } from '@/lib/theme-provider'
import { format } from 'date-fns'
import ShiftBy from '../ShiftBy/ShiftBy'
import HelperDialog from '../HelperDialog'
import { useReviewRequest } from './use-review-request'
import Skeleton from '../Skeleton'
import ConfirmDialog from '../ConfirmDialog'
import styles from './ModerateTeamCreationRequest.module.scss'
import { useHelperDialog } from '@/hooks/use-helper-dialog'

const routeApi = getRouteApi('/moderation/team-review/$teamId')

function ModerateTeamCreationRequest() {
  const { teamId } = routeApi.useParams()
  const loaderData = routeApi.useLoaderData()

  const { handleGoBack } = useGoBack()
  const { theme } = useTheme()
  const { title, content, mdast, isHelperOpen, handleHelperOpenChange } =
    useHelperDialog('seen_create_team_request_moderation_rules', loaderData)

  const {
    data,
    isPending,
    handleApprove,
    handleRevise,
    handleDecline,
    approveMutation,
    reviseMutation,
    declineMutation,
  } = useReviewRequest(teamId)

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Розгляд нової команди</h1>
        <HelperDialog
          title={title}
          content={content}
          mdast={mdast}
          open={isHelperOpen}
          onOpenChange={handleHelperOpenChange}
          trigger={(openDialog) => (
            <Button onClick={openDialog} className={styles.InfoButton}>
              <ClickTargetHelper />
              <Info size={20} />
              <VisuallyHidden>Довідка</VisuallyHidden>
            </Button>
          )}
        />
      </div>
      <main className={styles.Content}>
        <div className={clsx(styles.Card, styles.NavCard)}>
          <ol className={styles.Breadcrumbs}>
            <li className={styles.Crumb}>
              <Link
                className={styles.CrumbLink}
                to="/moderation"
                search={{ type: 'teams' }}
              >
                Запити на стоврення нової команди
              </Link>
            </li>
            <li className={clsx(styles.Crumb, styles.Current)}>
              Розгляд нової команди
            </li>
          </ol>
          <HelperDialog
            title={title}
            content={content}
            mdast={mdast}
            open={isHelperOpen}
            onOpenChange={handleHelperOpenChange}
            trigger={(openDialog) => (
              <Button onClick={openDialog} className={styles.HelperButton}>
                <Info size={16} />
                <span>Довідка</span>
              </Button>
            )}
          />
        </div>
        <div className={clsx(styles.Card, styles.Creator)}>
          <div className={styles.UserInfo}>
            <span>Запит від</span>
            <Link to="/about" className={styles.CreatorLink}>
              <Image
                layout="fullWidth"
                src={
                  data.creator.image
                    ? import.meta.env.VITE_STORAGE_URL + '' + data.creator.image
                    : `https://api.dicebear.com/9.x/glass/svg?seed=${data.creator.displayUsername}`
                }
                className={styles.UserImage}
              />
              <span>{data.creator.displayUsername}</span>
            </Link>
          </div>

          <div className={styles.MetaInfo}>
            <span className={styles.Dot}>•</span>
            <ShiftBy y={1}>
              {format(data.createdAt, 'dd.MM.yyyy HH:mm:ss')}
            </ShiftBy>
          </div>
        </div>
        <div className={styles.CardGroup}>
          <div className={clsx(styles.Card, styles.Cover)}>
            <div
              className={styles.ImageWrapper}
              style={
                {
                  '--aspect-ratio': '375 / 525',
                } as React.CSSProperties
              }
            >
              {data.coverUrl ? (
                <Image
                  layout="fullWidth"
                  src={`${import.meta.env.VITE_STORAGE_URL}${data.coverUrl}`}
                  alt="Обкладинка команди"
                  className={styles.Image}
                  loading="lazy"
                />
              ) : (
                <div className={styles.NoImage}>
                  <ImageOff size={24} />
                  <span>Не задано</span>
                </div>
              )}
              <h2 className={styles.ImageHeading}>Обкладинка</h2>
            </div>
          </div>
          <div className={clsx(styles.Card, styles.Title)}>
            <h2 className={styles.CardTitle}>Назва</h2>
            <div className={styles.TextField}>{data.name}</div>
          </div>
          <div className={clsx(styles.Card, styles.Description)}>
            <h2 className={styles.CardTitle}>Опис</h2>
            <div className={styles.TextField}>
              {data.description || 'Опису немає'}
            </div>
          </div>
        </div>

        <div className={styles.Card}>
          <div
            className={styles.ImageWrapper}
            style={{ '--aspect-ratio': '1450 / 540' } as React.CSSProperties}
          >
            {data.backgroundUrl ? (
              <Image
                layout="fullWidth"
                src={`${import.meta.env.VITE_STORAGE_URL}${data.backgroundUrl}`}
                alt="Задній фон команди"
                className={styles.Image}
                loading="lazy"
              />
            ) : (
              <div className={styles.NoImage}>
                <ImageOff size={24} />
                <span>Не задано</span>
              </div>
            )}
            <h2 className={styles.ImageHeading}>Задній фон</h2>
          </div>
        </div>

        <div className={styles.Card}>
          <h2 className={styles.CardTitle}>Посилання</h2>
          {data.links.length > 0 ? (
            data.links.map((link) => {
              const { icon: Icon, tone, toneDark } = LINK_META[link.type]

              return (
                <div key={link.id} className={styles.LinkField}>
                  <div
                    className={styles.IconWrapper}
                    style={
                      {
                        '--tone':
                          theme === 'dark' && toneDark ? toneDark : tone,
                      } as React.CSSProperties
                    }
                  >
                    <Icon />
                  </div>
                  <span className={styles.LinkUrl}>{link.url}</span>
                </div>
              )
            })
          ) : (
            <div className={styles.TextField}>Посилань немає</div>
          )}
        </div>
        <footer className={clsx(styles.Card, styles.Footer)}>
          <div className={styles.Actions}>
            <ConfirmDialog
              trigger={(openDialog) => (
                <MotionButton
                  className={clsx(styles.ApproveButton, 'Gradient', {
                    [styles.Pending]: isPending,
                  })}
                  onClick={openDialog}
                  disabled={isPending}
                >
                  {approveMutation.isPending ? 'Обробка...' : 'Схвалити'}
                </MotionButton>
              )}
              type="approve"
              onConfirm={() => handleApprove()}
            />
            <ConfirmDialog
              trigger={(openDialog) => (
                <MotionButton
                  className={clsx(styles.RejectButton, 'Gradient', {
                    [styles.Pending]: isPending,
                  })}
                  onClick={openDialog}
                  disabled={isPending}
                >
                  {reviseMutation.isPending ? 'Обробка...' : 'Доопрацювати'}
                </MotionButton>
              )}
              type="revise"
              onConfirm={(message) => handleRevise(message)}
            />
            <ConfirmDialog
              trigger={(openDialog) => (
                <MotionButton
                  className={clsx(styles.HardRejectButton, {
                    [styles.Pending]: isPending,
                  })}
                  onClick={openDialog}
                  disabled={isPending}
                >
                  {declineMutation.isPending ? 'Обробка...' : 'Відхилити'}
                </MotionButton>
              )}
              type="decline"
              onConfirm={(message) => handleDecline(message)}
            />
          </div>
        </footer>
      </main>
    </div>
  )
}

export function ModerateTeamCreationRequestSkeleton() {
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
                className={styles.CrumbLink}
                to="/moderation"
                search={{ type: 'teams' }}
              >
                Запити на стоврення нової команди
              </Link>
            </li>
            <li className={clsx(styles.Crumb, styles.Current)}>
              Розгляд нової команди
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
            <div
              className={styles.ImageWrapper}
              style={
                {
                  '--aspect-ratio': '375 / 525',
                } as React.CSSProperties
              }
            >
              <Skeleton width="100%" height="100%" />
              <h2 className={styles.ImageHeading}>Обкладинка</h2>
            </div>
          </div>
          <div className={clsx(styles.Card, styles.Title)}>
            <h2 className={styles.CardTitle}>Назва</h2>
            <Skeleton width="60%" height="28px" borderRadius="4px" />
          </div>
          <div className={clsx(styles.Card, styles.Description)}>
            <h2 className={styles.CardTitle}>Опис</h2>
            <div className={styles.DescriptionLines}>
              <Skeleton width="100%" height="16px" borderRadius="4px" />
              <Skeleton width="90%" height="16px" borderRadius="4px" />
              <Skeleton width="40%" height="16px" borderRadius="4px" />
            </div>
          </div>
        </div>

        <div className={styles.Card}>
          <div
            className={styles.ImageWrapper}
            style={{ '--aspect-ratio': '1450 / 540' } as React.CSSProperties}
          >
            <Skeleton width="100%" height="100%" />
            <h2 className={styles.ImageHeading}>Задній фон</h2>
          </div>
        </div>

        <div className={styles.Card}>
          <h2 className={styles.CardTitle}>Посилання</h2>
          <div className={styles.LinkSkeleton}>
            <Skeleton width="100%" height="40px" borderRadius="4px" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ModerateTeamCreationRequest
