import { Button, Dialog } from '@base-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import 'react-cropper/dist/cropper.css'
import clsx from 'clsx'
import ClickTargetHelper from '../ClickTargetHelper'
import styles from './ConfirmDialog.module.scss'

interface ConfirmDialogProps {
  isOpen: boolean
  onIsOpenChange: (open: boolean) => void
  title?: string
  description: React.ReactNode
  onConfirm: () => void | Promise<void>
  children?: React.ReactNode
}

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

function ConfirmDialog({
  isOpen,
  onIsOpenChange,
  title = 'Підтвердіть дію',
  description,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  async function handleConfirm() {
    await onConfirm()
    onIsOpenChange(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onIsOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal keepMounted>
            <MotionBackdrop
              onClick={() => onIsOpenChange(false)}
              className={styles.Overlay}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <MotionPopup
              className={styles.Popup}
              initial={{ opacity: 0, y: '-10%', filter: 'blur(4px)' }}
              animate={{
                opacity: 1,
                y: '0%',
                filter: 'blur(0px)',
                transition: { type: 'spring', duration: 0.25, bounce: 0 },
              }}
              exit={{
                opacity: 0,
                y: '-10%',
                filter: 'blur(4px)',
                transition: { type: 'spring', duration: 0.35, bounce: 0 },
              }}
            >
              <h1 className={styles.Heading}>{title}</h1>
              <p className={styles.Description}>{description}</p>
              {children}
              <div className={styles.ActionsSection}>
                <Button
                  className={clsx(styles.ConfirmButton, 'Gradient')}
                  onClick={handleConfirm}
                >
                  <ClickTargetHelper />
                  Підтвердити
                </Button>
                <Button
                  className={clsx(styles.CancelButton, 'Gradient')}
                  render={<Dialog.Close />}
                >
                  <ClickTargetHelper />
                  Скасувати
                </Button>
              </div>
            </MotionPopup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default ConfirmDialog
