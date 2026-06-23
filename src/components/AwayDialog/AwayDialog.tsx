import { Checkbox, Dialog } from '@base-ui/react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  Variants,
} from 'motion/react'
import React, { useEffect, useState } from 'react'
import MotionButton from '../MotionButton'
import { CheckIcon, XIcon } from 'lucide-react'
import clsx from 'clsx'
import styles from './AwayDialog.module.scss'
import VisuallyHidden from '../VisuallyHidden'
import ClickTargetHelper from '../ClickTargetHelper'
import { useMediaQuery } from '@/hooks/use-media-query'
import { addTrustedHostname, isTrustedHostname } from '@/lib/utils'

interface AwayDialogProps {
  url: string
  isOpen: boolean
  onIsOpenChange: (open: boolean) => void
}

const MotionOverlay = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

function AwayDialog({ url, isOpen, onIsOpenChange }: AwayDialogProps) {
  const [isTrusted, setIsTrusted] = useState(false)
  const matches = useMediaQuery('(min-width: 40.625rem)') // має збігатися з tablet breakpoint
  const shouldReduceMotion = useReducedMotion()

  const hostname = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  })()

  useEffect(() => {
    if (!isOpen) setIsTrusted(false)
  }, [isOpen])

  const popupVariants: Variants = matches
    ? {
        hidden: {
          opacity: shouldReduceMotion ? 0 : 1,
          scale: shouldReduceMotion ? 1 : 0,
          rotate: shouldReduceMotion ? '0deg' : '12.5deg',
        },
        visible: { opacity: 1, scale: 1, rotate: '0deg' },
        exit: { scale: shouldReduceMotion ? 1 : 0, rotate: '0deg', opacity: 0 },
      }
    : {
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? '0%' : '-10%',
          filter: 'blur(4px)',
        },
        visible: {
          opacity: 1,
          y: '0%',
          filter: 'blur(0px)',
          transition: { type: 'spring', duration: 0.25, bounce: 0 },
        },
        exit: {
          opacity: 0,
          y: shouldReduceMotion ? '0%' : '-5%',
          filter: 'blur(4px)',
          transition: { type: 'spring', duration: 0.2, bounce: 0 },
        },
      }

  function handleOpenExternalLink() {
    if (isTrusted && hostname) {
      addTrustedHostname(hostname)
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    onIsOpenChange(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal>
            <MotionOverlay
              className={styles.Overlay}
              onClick={() => onIsOpenChange(false)}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <div className={styles.OuterContainer}>
              <MotionPopup
                className={styles.Popup}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={popupVariants}
              >
                <Dialog.Title render={<h1 />} className={styles.Heading}>
                  Покинути 'Моя Манга'
                </Dialog.Title>
                <MotionButton
                  render={<Dialog.Close />}
                  className={clsx(styles.CloseButton, 'Gradient')}
                >
                  <XIcon size={24} />
                  <VisuallyHidden>Закрити діалогове вікно</VisuallyHidden>
                  <ClickTargetHelper />
                </MotionButton>
                <p className={styles.Paragraph}>
                  За цим посиланням ви перейдете на наступний вебсайт
                </p>
                <div className={styles.Url}>
                  {hostname
                    ? url.split(hostname).map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className={styles.Hostname}>{hostname}</span>
                          )}
                        </React.Fragment>
                      ))
                    : url}
                </div>
                {hostname && !isTrustedHostname(hostname) && (
                  <div className={styles.CheckboxWrapper}>
                    <Checkbox.Root
                      checked={isTrusted}
                      onCheckedChange={(checked) => setIsTrusted(checked)}
                      id="trusted-source"
                      nativeButton={true}
                      render={<button />}
                      className={styles.Checkbox}
                      style={{ position: 'relative' }} // для ClickTargetHelper компонента
                    >
                      <Checkbox.Indicator
                        className={styles.Indicator}
                        keepMounted={true}
                      >
                        <CheckIcon />
                      </Checkbox.Indicator>
                      <ClickTargetHelper />
                    </Checkbox.Root>
                    <label
                      className={styles.CheckboxLabel}
                      htmlFor="trusted-source"
                    >
                      Відтепер довіряти вебсайту{' '}
                      <span className={styles.Hostname}>{hostname}</span>
                    </label>
                  </div>
                )}

                <div className={styles.Actions}>
                  <MotionButton
                    className={clsx(styles.SecondaryButton, 'Gradient')}
                    onClick={() => onIsOpenChange(false)}
                  >
                    Назад
                  </MotionButton>
                  <MotionButton
                    className={clsx(styles.PrimaryButton, 'Gradient')}
                    onClick={handleOpenExternalLink}
                  >
                    Відвідати сайт
                  </MotionButton>
                </div>
              </MotionPopup>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default AwayDialog
