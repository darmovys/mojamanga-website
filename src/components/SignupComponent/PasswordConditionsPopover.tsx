import {
  PasswordConditionsContent,
  type PasswordConditions,
} from './PasswordConditions'
import { useFloating, offset, shift } from '@floating-ui/react'
import styles from './PasswordConditionsPopover.module.scss'

type StrengthScore = 1 | 2 | 3 | 4 | 5

interface Props {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  conditions: PasswordConditions
  strengthScore: StrengthScore
}

export function PasswordConditionsPopover({
  open,
  anchorRef,
  conditions,
  strengthScore,
}: Props) {
  const { floatingStyles, refs } = useFloating({
    elements: { reference: anchorRef.current },
    placement: 'right',
    middleware: [offset(8), shift({ crossAxis: true })],
    transform: false,
  })

  if (!open) return null

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={styles.Popup}
      id="password-conditions"
      role="tooltip"
      aria-live="polite"
    >
      <PasswordConditionsContent
        conditions={conditions}
        strengthScore={strengthScore}
      />
    </div>
  )
}
