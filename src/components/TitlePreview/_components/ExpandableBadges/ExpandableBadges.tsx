import { Link } from '@tanstack/react-router'
import { AGE_RESTRICTION_LABELS } from '@/lib/constants'
import { AgeRestriction } from '@/generated/prisma/enums'
import { BadgeItem, useExpendableBadges } from './use-expendable-badges'
import { Button } from '@base-ui/react'
import styles from './ExpandableBadges.module.scss'

export function ExpandableBadges({ items }: { items: BadgeItem[] }) {
  const { measureRef, displayedItems, isExpanded, setIsExpanded, hiddenCount } =
    useExpendableBadges(items)

  return (
    <div className={styles.BadgesWrapper}>
      {/* Прихований контейнер для розрахунку ліній */}
      <div
        ref={measureRef}
        className={styles.MeasureContainer}
        aria-hidden="true"
      >
        {items.map((item) => {
          if (
            item.ageRestriction &&
            item.ageRestriction === AgeRestriction.NO_RESTRICTION
          )
            return

          return (
            <span
              key={item.id}
              data-measure-badge
              className={
                item.ageRestriction ? styles.AgeBadge : styles.TagBadge
              }
            >
              {item.ageRestriction
                ? AGE_RESTRICTION_LABELS[item.ageRestriction]
                : item.label}
            </span>
          )
        })}
      </div>

      {/* Реальний інтерактивний контейнер */}
      <div className={styles.TagsList}>
        {displayedItems.map((item) => {
          if (
            item.ageRestriction &&
            item.ageRestriction === AgeRestriction.NO_RESTRICTION
          )
            return
          return (
            <Link
              to="/catalog"
              key={item.id}
              className={
                item.ageRestriction ? styles.AgeBadge : styles.TagBadge
              }
            >
              {item.ageRestriction
                ? AGE_RESTRICTION_LABELS[item.ageRestriction]
                : item.label}
            </Link>
          )
        })}

        {!isExpanded && hiddenCount > 0 && (
          <Button
            className={styles.TagBadge}
            onClick={() => setIsExpanded(true)}
          >
            + {`ще ${hiddenCount}`}
          </Button>
        )}

        {isExpanded && (
          <Button
            className={styles.TagBadge}
            onClick={() => setIsExpanded(false)}
          >
            ...згорнути
          </Button>
        )}
      </div>
    </div>
  )
}
