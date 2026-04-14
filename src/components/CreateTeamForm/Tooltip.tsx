import { Tooltip as BaseUITooltip, Button } from '@base-ui/react'
import styles from './Tooltip.module.scss'
import { Asterisk } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import ClickTargetHelper from '../ClickTargetHelper'

export function Tooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCoarse, setIsCoarse] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    setIsCoarse(mediaQuery.matches)

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsCoarse(e.matches)
    }

    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [])

  useEffect(() => {
    if (!isCoarse || !isOpen) return

    const handleOutsideClick = (e: PointerEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick, true)
    return () =>
      document.removeEventListener('pointerdown', handleOutsideClick, true)
  }, [isCoarse, isOpen])

  return (
    <BaseUITooltip.Provider delay={100}>
      <BaseUITooltip.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!isCoarse) {
            setIsOpen(open)
          }
        }}
      >
        <BaseUITooltip.Trigger
          ref={triggerRef}
          className={styles.Button}
          render={<Button />}
          onClick={() => {
            if (isCoarse) {
              setIsOpen((prev) => !prev)
            }
          }}
        >
          <ClickTargetHelper />
          <Asterisk size={14} />
        </BaseUITooltip.Trigger>

        <BaseUITooltip.Portal>
          <BaseUITooltip.Positioner align="start" sideOffset={5}>
            <BaseUITooltip.Popup className={styles.Popup}>
              <BaseUITooltip.Arrow className={styles.Arrow}>
                <ArrowSvg />
              </BaseUITooltip.Arrow>
              {text}
            </BaseUITooltip.Popup>
          </BaseUITooltip.Positioner>
        </BaseUITooltip.Portal>
      </BaseUITooltip.Root>
    </BaseUITooltip.Provider>
  )
}

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className={styles.ArrowFill}
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className={styles.ArrowOuterStroke}
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className={styles.ArrowInnerStroke}
      />
    </svg>
  )
}
