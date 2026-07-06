import { getRouteApi, Link, Outlet } from '@tanstack/react-router'
import styles from './UserProfile.module.scss'
import { useGoBack } from '@/hooks/use-go-back'
import { Button } from '@base-ui/react'
import VisuallyHidden from '../VisuallyHidden'
import ClickTargetHelper from '../ClickTargetHelper'
import {
  ArrowLeft,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from 'lucide-react'
import { Image } from '@unpic/react'
import MobileNavigation from '../MobileNavigation'
import Tooltip from '../Tooltip'
import ShiftBy from '../ShiftBy/ShiftBy'
import MotionButton from '../MotionButton'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'
import { formatCompactNumber, getRandom, pluralize, range } from '@/lib/utils'
import useProfile from './use-profile'
import Skeleton from '../Skeleton'
const routeApi = getRouteApi('/user/$id')

type RenderStatItemProps = {
  count: number
  words: string[]
  prefix?: string
}

function UserProfile() {
  const { handleGoBack } = useGoBack()
  const layoutId = useId()
  const { id } = routeApi.useParams()

  const {
    data,
    tone,
    label,
    timeElapsed,
    primaryStats,
    secondaryStats,
    isLeftChevronVisible,
    isRightChevronVisible,
    scrollNav,
    navItems,
    navRef,
    handleItemClick,
    checkScrollVisibility,
  } = useProfile(id)

  const renderStatItem = ({ count, words, prefix }: RenderStatItemProps) => {
    const formattedNumber =
      count >= 1000 ? (
        <Tooltip className={styles.StatisticsTooltip} text={`${count}`}>
          {formatCompactNumber(count)}
        </Tooltip>
      ) : (
        formatCompactNumber(count)
      )

    return (
      <span key={words[0]} className={styles.StatisticsTitle}>
        {prefix && `${prefix} `}
        {formattedNumber} {pluralize(count, words, true)}
      </span>
    )
  }

  return (
    <>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Профіль користувача</h1>
        {data.isMe && (
          <Button
            nativeButton={false}
            render={
              <Link to="/user/$id/settings" params={{ id: data.user.id }} />
            }
            className={styles.SettingsButton}
          >
            <ClickTargetHelper />
            <SettingsIcon size={20} />
            <VisuallyHidden>Налаштування профілю</VisuallyHidden>
          </Button>
        )}
      </div>
      <div
        className={styles.Wrapper}
        data-no-background={!data.user.backgroundUrl}
      >
        <div
          className={styles.Background}
          style={
            {
              '--background-url': data.user.backgroundUrl
                ? `url(${import.meta.env.VITE_STORAGE_URL}${data.user.backgroundUrl})`
                : 'transparent',
              '--pc-height': data.user.backgroundUrl
                ? 'var(--320px)'
                : 'var(--160px)',
              '--mobile-height': data.user.backgroundUrl
                ? 'var(--160px)'
                : 'var(--48px)',
            } as React.CSSProperties
          }
        />
        <div className={styles.UsernameSection}>
          <div className={styles.CoverWrapper}>
            <Image
              layout="fullWidth"
              src={
                data.user.image
                  ? `${import.meta.env.VITE_STORAGE_URL}${data.user.image}`
                  : `https://api.dicebear.com/9.x/glass/svg?seed=${data.user.displayUsername}`
              }
              alt={data.user.displayUsername}
            />
          </div>
          {data.user.role !== 'USER' && (
            <ShiftBy
              className={styles.TabletDown}
              style={{ gridArea: 'badge' }}
              y={16}
            >
              <div
                className={styles.Badge}
                style={{ '--background-color': tone } as React.CSSProperties}
              >
                {label}
              </div>
            </ShiftBy>
          )}
          <div className={styles.Username}>
            <Tooltip
              className={styles.UsernameTooltip}
              align="center"
              text={data.user.displayUsername}
            >
              <div className={styles.TruncatedText}>
                {data.user.displayUsername}
              </div>
            </Tooltip>
            {data.user.role !== 'USER' && (
              <ShiftBy className={styles.LaptopUp} y={-5.6}>
                <div
                  className={styles.Badge}
                  style={{ '--background-color': tone } as React.CSSProperties}
                >
                  {label}
                </div>
              </ShiftBy>
            )}
            {data.isMe && (
              <MotionButton
                nativeButton={false}
                render={
                  <Link to="/user/$id/settings" params={{ id: data.user.id }} />
                }
                className={clsx(styles.SettingsButtonTablet, 'Gradient')}
              >
                <SettingsIcon size={14} /> Налаштування
              </MotionButton>
            )}
          </div>
          <div className={styles.UsernameMeta}>
            <span className={styles.StatisticsTitle}>
              З нами вже {timeElapsed}
            </span>

            {primaryStats.map(renderStatItem)}

            <span style={{ flexBasis: '100%' }}></span>

            {secondaryStats.map(renderStatItem)}
          </div>
        </div>
        <div className={styles.NavigationContainer}>
          <NavScrollButton
            isVisible={isLeftChevronVisible}
            direction="left"
            onClick={() => scrollNav('left')}
            wrapperClassName={styles.LeftChevronWrapper}
            buttonClassName={styles.Chevron}
          />

          <NavScrollButton
            isVisible={isRightChevronVisible}
            direction="right"
            onClick={() => scrollNav('right')}
            wrapperClassName={styles.RightChevronWrapper}
            buttonClassName={styles.Chevron}
          />
          <nav
            className={styles.Navigation}
            ref={navRef}
            onScroll={checkScrollVisibility}
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                className={styles.NavLink}
                to={item.to}
                params={{ id: data.user.id }}
                replace={true}
                onClick={handleItemClick}
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>

                    {isActive && (
                      <motion.span
                        layoutId={layoutId}
                        initial={{
                          borderTopLeftRadius: 'var(--4px)',
                          borderTopRightRadius: 'var(--4px)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        className={styles.Indicator}
                      />
                    )}
                  </>
                )}
              </Link>
            ))}
            {data.isMe && (
              <MotionButton
                nativeButton={false}
                render={
                  <Link to="/user/$id/settings" params={{ id: data.user.id }} />
                }
                className={clsx(styles.SettingsButtonLaptop, 'Gradient')}
              >
                <SettingsIcon size={14} /> Налаштування
              </MotionButton>
            )}
          </nav>
        </div>
        <main className={styles.Main}>
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </>
  )
}

export function UserProfileSkeleton() {
  const { handleGoBack } = useGoBack()

  return (
    <>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Профіль користувача</h1>
      </div>
      <div className={styles.Wrapper} data-no-background="true">
        <div
          className={styles.Background}
          style={
            {
              '--background-url': 'transparent',
              '--pc-height': 'var(--160px)',
              '--mobile-height': 'var(--48px)',
            } as React.CSSProperties
          }
        />
        <div className={styles.UsernameSection}>
          <div className={styles.CoverWrapper}>
            <div
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <Skeleton />
            </div>
          </div>

          <div className={styles.Username}>
            <Skeleton width="180px" height="28px" borderRadius="6px" />
          </div>

          <div className={styles.UsernameMeta}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--6px)',
                maxInlineSize: 'var(--320px)',
              }}
            >
              {range(6).map((index) => (
                <Skeleton
                  key={index}
                  width={`${getRandom(60, 100)}px`}
                  height="14px"
                  borderRadius="4px"
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.NavigationContainer}>
          <nav className={styles.Navigation}>
            {range(5).map((index) => (
              <div
                key={index}
                className={styles.NavLink}
                style={{ pointerEvents: 'none' }}
              >
                <Skeleton width="75px" height="24px" borderRadius="4px" />
              </div>
            ))}
          </nav>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}

const chevronAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, filter: 'blur(4px)' },
  transition: { type: 'spring', duration: 0.45, bounce: 0 },
} as const

interface NavButtonProps {
  isVisible: boolean
  direction: 'left' | 'right'
  onClick: () => void
  wrapperClassName: string
  buttonClassName: string
}

function NavScrollButton({
  isVisible,
  direction,
  onClick,
  wrapperClassName,
  buttonClassName,
}: NavButtonProps) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon
  const hiddenText =
    direction === 'left'
      ? 'Прогорнути навігацію назад'
      : 'Прогорнути навігацію вперед'

  return (
    <AnimatePresence mode="popLayout">
      {isVisible && (
        <motion.div {...chevronAnimation} className={wrapperClassName}>
          <Button className={buttonClassName} onClick={onClick}>
            <Icon size={24} />
            <ClickTargetHelper />
            <VisuallyHidden>{hiddenText}</VisuallyHidden>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UserProfile
