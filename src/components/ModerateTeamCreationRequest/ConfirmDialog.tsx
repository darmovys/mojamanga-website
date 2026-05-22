import { Button, Dialog } from '@base-ui/react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import 'react-cropper/dist/cropper.css'
import clsx from 'clsx'
import ClickTargetHelper from '../ClickTargetHelper'
import styles from './ConfirmDialog.module.scss'

const options = {
  approve: {
    description: 'Ви точно хочете схвалити запит?',
  },
  revise: {
    description: 'Ви точно хочете відправити запит на доопрацювання?',
  },
  decline: {
    description: 'Ви точно хочете відхилити запит?',
  },
} as const

type ConfirmDialogType = keyof typeof options

interface ConfirmDialogProps {
  type: ConfirmDialogType
  trigger: (open: () => void) => React.ReactNode
  onConfirm: (message: string) => void
}

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

export function ConfirmDialog({
  type,
  trigger,
  onConfirm,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  function handleConfirm() {
    setIsOpen(false)
    onConfirm(message)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {trigger(() => setIsOpen(true))}
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal keepMounted>
            <MotionBackdrop
              onClick={() => setIsOpen(false)}
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
              <h1 className={styles.Heading}>Підтвердіть дію</h1>
              <p className={styles.Description}>{options[type].description}</p>
              {type !== 'approve' && (
                <textarea
                  name="message"
                  id="message"
                  placeholder="Опишіть причину (рекомендовано)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.MessageField}
                />
              )}

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
                  onClick={() => setIsOpen(false)}
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
