import { Button, Dialog, Separator } from '@base-ui/react'
import styles from './ModerationMenuMobileDialog.module.scss'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import clsx from 'clsx'
import VisuallyHidden from '../VisuallyHidden'
import { X } from 'lucide-react'
import { NavItems } from './NavItems'

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

type ModerationMenuMobileDialogProps = {
  trigger: (open: () => void) => React.ReactNode
}

function ModerationMenuMobileDialog({
  trigger,
}: ModerationMenuMobileDialogProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      {trigger(() => setIsMobileMenuOpen(true))}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Dialog.Portal keepMounted>
            <MotionBackdrop
              onClick={() => setIsMobileMenuOpen(false)}
              className={styles.Backdrop}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <MotionPopup
              initial={{ opacity: 0, scale: 1.02, y: -3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -3 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
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
                      <VisuallyHidden>Закрити</VisuallyHidden>
                    </Button>
                  }
                />
              </header>
              <Separator
                className={styles.Separator}
                orientation={'horizontal'}
              />
              <NavItems
                separator={'dark'}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </MotionPopup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default ModerationMenuMobileDialog
