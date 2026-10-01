import { Button, Dialog, Separator } from '@base-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { Navigation } from '..'
import VisuallyHidden from '@/components/VisuallyHidden'
import styles from './DialogNavigation.module.scss'

interface DialogNavigationProps {
  isOpen: boolean
  onIsOpenChange: (isOpen: boolean) => void
}

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

export function DialogNavigation({
  isOpen,
  onIsOpenChange,
}: DialogNavigationProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal keepMounted>
            <MotionBackdrop
              onClick={() => onIsOpenChange(false)}
              className={styles.Backdrop}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <MotionPopup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
              className={styles.Popup}
            >
              <header className={styles.HeaderSection}>
                <Dialog.Title render={<h1 />} className={styles.Heading}>
                  Меню
                </Dialog.Title>
                <Dialog.Close
                  render={
                    <Button className={clsx(styles.CloseButton, 'Gradient')}>
                      <X size={18} />
                      <VisuallyHidden>Закрити вікно</VisuallyHidden>
                    </Button>
                  }
                />
              </header>
              <Separator
                className={styles.Separator}
                orientation={'horizontal'}
              />
              <div style={{ marginInline: 'calc(var(--10px) * -1)' }}>
                <Navigation onLinkClick={() => onIsOpenChange(false)} />
              </div>
            </MotionPopup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
