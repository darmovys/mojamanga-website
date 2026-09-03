import MotionButton from '../MotionButton'
import { pluralize } from '@/lib/utils'
import { MoreButton } from './MoreButton'
import { TeamInfoDialog } from './TeamInfoDialog'
import { Button } from '@base-ui/react'
import { Image } from '@unpic/react'
import { getRouteApi } from '@tanstack/react-router'
import Skeleton from '../Skeleton'
import { useTeamHeroSection } from './use-team-hero-section'
import clsx from 'clsx'
import styles from './TeamHeroSection.module.scss'

const routeApi = getRouteApi('/team/$id/')

function TeamHeroSection() {
  const { id } = routeApi.useParams()

  const {
    profileData,
    accentColor,
    isInfoOpen,
    setIsInfoOpen,
    handleOpenInfo,
    isPending,
    isError,
    avgChaptersPerMonth,
  } = useTeamHeroSection(id)

  return (
    <header
      className={styles.Hero}
      data-no-background={profileData.backgroundUrl ? undefined : ''}
      style={
        {
          '--lightness': accentColor?.l,
          '--chroma': accentColor?.c,
          '--hue': accentColor?.h,
        } as React.CSSProperties
      }
    >
      <div className={styles.BackgroundWrapper}>
        <div
          className={styles.BackgroundImage}
          style={
            {
              '--url': profileData.backgroundUrl
                ? `url(${import.meta.env.VITE_STORAGE_URL + profileData.backgroundUrl.replace(' ', '%20')})`
                : undefined,
            } as React.CSSProperties
          }
        />
      </div>

      <div className={styles.Container}>
        <div className={styles.Content}>
          <h1 className={styles.Title}>{profileData.name}</h1>

          <div
            className={styles.Stats}
            data-no-description={
              profileData.descriptionPreview ? undefined : ''
            }
          >
            {isPending ? (
              <Skeleton
                style={{ marginInlineEnd: 'var(--4px)' }}
                height="1rem"
                width="7.5rem"
                borderRadius="var(--6px)"
              />
            ) : !isError && avgChaptersPerMonth != null ? (
              <span className={styles.AvgChapters}>
                {avgChaptersPerMonth}{' '}
                {pluralize(avgChaptersPerMonth, [
                  'розділ/міс.',
                  'розділи/міс.',
                  'розділів/міс.',
                ])}
              </span>
            ) : null}

            <span>
              {profileData._count.publishingVersions}{' '}
              {pluralize(profileData._count.publishingVersions, [
                'твір',
                'твори',
                'творів',
              ])}
            </span>
          </div>

          {profileData.descriptionPreview && (
            <Button
              nativeButton={false}
              render={<p />}
              className={styles.Description}
              onClick={handleOpenInfo}
              aria-label="Додаткова інформація про команду"
            >
              {profileData.descriptionPreview}
            </Button>
          )}

          <div className={styles.Actions}>
            <MotionButton className={clsx(styles.PrimaryButton, 'Gradient')}>
              {profileData.isMember ? 'Вийти з команди' : 'Податися в команду'}
            </MotionButton>

            <div className={styles.LaptopAndUp}>
              <MoreButton
                size={18}
                onOpenAbout={handleOpenInfo}
                acceptsApplications={profileData.acceptsApplications}
                currentUserRoles={profileData.currentUserRoles}
                isMember={profileData.isMember}
                teamId={id}
              />
            </div>
          </div>
        </div>
        {!profileData.backgroundUrl && (
          <div className={styles.CoverSection}>
            <Image
              className={styles.CoverImage}
              alt="Обкладинка команди"
              layout="constrained"
              height={260}
              width={260}
              src={import.meta.env.VITE_STORAGE_URL + profileData.coverUrl}
            />
          </div>
        )}
      </div>

      <div className={styles.TabletAndDown}>
        <MoreButton
          size={24}
          onOpenAbout={handleOpenInfo}
          acceptsApplications={profileData.acceptsApplications}
          currentUserRoles={profileData.currentUserRoles}
          isMember={profileData.isMember}
          teamId={id}
        />
      </div>

      <TeamInfoDialog
        name={profileData.name}
        isOpen={isInfoOpen}
        onIsOpenChange={setIsInfoOpen}
      />
    </header>
  )
}

export default TeamHeroSection
