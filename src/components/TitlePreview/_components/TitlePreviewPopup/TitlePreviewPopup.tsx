import { PreviewCard } from '@base-ui/react'
import { Link } from '@tanstack/react-router'
import { TITLE_STATUS_LABELS, TRANSLATION_STATUS_LABELS } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { titlesQueries } from '@/services/queries'
import { AddToBookmartkBtn, ExpandableBadges, ExpandableDescription } from '..'
import Skeleton from '@/components/Skeleton'
import styles from './TitlePreviewPopup.module.scss'

interface TitlePreviewProps {
  titleId: string
  isOpen: boolean
}

export function TitlePreviewPopup({ titleId, isOpen }: TitlePreviewProps) {
  const { data, isLoading, isError } = useQuery({
    ...titlesQueries.titlePreview(titleId),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner
        side="right"
        align="start"
        sideOffset={12}
        positionMethod="fixed"
      >
        <PreviewCard.Popup className={styles.PreviewPopup}>
          {isLoading && <PreviewSkeleton />}
          {isError && (
            <div className={styles.ErrorMessage}>
              Не вдалося отримати інформацію про твір.
            </div>
          )}
          {data && (
            <div className={styles.PreviewContent}>
              {/* Заголовки */}
              <div className={styles.PreviewHeader}>
                <h3 className={styles.PopupTitle}>
                  {data.currentVersion.nameUkr}
                </h3>
                <span className={styles.PopupSubtitle}>
                  {data.currentVersion.nameEng}
                </span>
              </div>

              {/* Сітка метаданих 2х2 */}
              <div className={styles.MetaGrid}>
                <Link to="/catalog" className={styles.MetaItem}>
                  <span className={styles.MetaLabel}>Статус твору</span>
                  <span className={styles.MetaValue}>
                    {TITLE_STATUS_LABELS[data.currentVersion.titleStatus]}
                  </span>
                </Link>
                <Link to="/catalog" className={styles.MetaItem}>
                  <span className={styles.MetaLabel}>Статус перекладу</span>
                  <span className={styles.MetaValue}>
                    {
                      TRANSLATION_STATUS_LABELS[
                        data.currentVersion.translationStatus
                      ]
                    }
                  </span>
                </Link>
                <Link to="/catalog" className={styles.MetaItem}>
                  <span className={styles.MetaLabel}>Рік випуску</span>
                  <span className={styles.MetaValue}>
                    {data.currentVersion.releaseYear}
                  </span>
                </Link>
                <Link to="/catalog" className={styles.MetaItem}>
                  <span className={styles.MetaLabel}>Розділів</span>
                  <span className={styles.MetaValue}>{data.chaptersCount}</span>
                </Link>
              </div>

              {/* Опис */}
              <ExpandableDescription text={data.currentVersion.description} />

              {/* Теги та жанри */}
              <ExpandableBadges
                items={[
                  {
                    id: 'age',
                    ageRestriction: data.currentVersion.ageRestriction,
                  },
                  ...data.currentVersion.genres.map(({ genre }) => ({
                    id: `genre-${genre.id}`,
                    label: genre.name,
                  })),
                  ...data.currentVersion.tags.map(({ tag }) => ({
                    id: `tag-${tag.id}`,
                    label: '# ' + tag.name,
                  })),
                ]}
              />

              {/* Кнопка керування закладою до твору */}
              <AddToBookmartkBtn
                bookmarkFolders={data.bookmarkFolders}
                activeFolder={data.activeFolder}
                titleId={titleId}
              />
            </div>
          )}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}

function PreviewSkeleton() {
  return (
    <div className={styles.SkeletonContainer}>
      <Skeleton className={styles.SkeletonTitle} />
      <Skeleton className={styles.SkeletonSubtitle} />
      <div className={styles.SkeletonGrid}>
        <Skeleton className={styles.SkeletonMeta} />
        <Skeleton className={styles.SkeletonMeta} />
        <Skeleton className={styles.SkeletonMeta} />
        <Skeleton className={styles.SkeletonMeta} />
      </div>

      <Skeleton className={styles.SkeletonText} />
      <Skeleton className={styles.SkeletonTextShort} />
    </div>
  )
}
