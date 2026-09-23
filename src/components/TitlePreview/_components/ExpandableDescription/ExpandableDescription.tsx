import { Button } from '@base-ui/react'
import { useExpendableDescription } from './use-expendable-description'
import styles from './ExpandableDescription.module.scss'

interface ExpandableDescriptionProps {
  text: string | null
}

export function ExpandableDescription({ text }: ExpandableDescriptionProps) {
  const { textRef, canOverflow, isExpanded, setIsExpanded } =
    useExpendableDescription(text)

  const isCollapsed = canOverflow && !isExpanded

  return (
    <div className={styles.PreviewDescription}>
      <div
        className={styles.TextWrapper}
        data-collapsed={isCollapsed ? '' : undefined}
      >
        <p
          ref={textRef}
          className={isCollapsed ? styles.ClampDescription : undefined}
        >
          {text ? text : 'Немає опису'}
        </p>
      </div>
      {canOverflow && (
        <Button
          className={styles.ToggleTextButton}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Згорнути' : 'Детальніше...'}
        </Button>
      )}
    </div>
  )
}
