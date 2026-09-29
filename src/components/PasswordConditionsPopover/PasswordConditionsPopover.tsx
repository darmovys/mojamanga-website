import { useFloating, offset, shift, flip, Placement } from '@floating-ui/react'
import clsx from 'clsx'
import PasswordConditions, {
  type PasswordConditionsProps,
} from '../PasswordConditions'
import styles from './PasswordConditionsPopover.module.scss'

type StrengthScore = 1 | 2 | 3 | 4 | 5

interface Props {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  conditions: PasswordConditionsProps
  strengthScore: StrengthScore
  placement?: Placement
  fallbackPlacements?: Placement[]
  className?: string
}

function PasswordConditionsPopover({
  open,
  anchorRef,
  conditions,
  strengthScore,
  placement = 'right',
  fallbackPlacements,
  className,
}: Props) {
  const { floatingStyles, refs } = useFloating({
    elements: { reference: anchorRef.current },
    placement: placement,

    middleware: [
      offset(8),
      shift({ crossAxis: true }),
      flip({ fallbackPlacements }),
    ],
    transform: false,
  })

  if (!open) return null

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={clsx(styles.Popup, className)}
      id="password-conditions"
      role="tooltip"
      aria-live="polite"
    >
      <PasswordConditions
        conditions={conditions}
        strengthScore={strengthScore}
      />
    </div>
  )
}

export default PasswordConditionsPopover
