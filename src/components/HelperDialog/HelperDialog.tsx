import { Dialog, ScrollArea, Separator } from '@base-ui/react'
import styles from './HelperDialog.module.scss'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import MotionButton from '../MotionButton'
import clsx from 'clsx'
import VisuallyHidden from '../VisuallyHidden'
import MDX from '../MDX'
import { JsonValue } from '../../../content-collections'

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

type HelperDialogProps = {
  trigger: (open: () => void) => React.ReactNode
  title: string
  content: string
  mdast: JsonValue
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function HelperDialog({
  trigger,
  title,
  content,
  mdast,
  open: controlledOpen,
  onOpenChange,
}: HelperDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  // Визначаємо, чи керується стан зовні
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(open)
    }
    // Якщо батьківський компонент передав onOpenChange, викликаємо його
    if (onOpenChange) {
      onOpenChange(open)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger(() => handleOpenChange(true))}
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal keepMounted>
            <MotionBackdrop
              onClick={() => handleOpenChange(false)}
              className={styles.Backdrop}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <Dialog.Viewport className={styles.Viewport}>
              <ScrollArea.Root
                className={styles.ScrollViewport}
                style={{ position: undefined }}
              >
                <ScrollArea.Viewport className={styles.ScrollViewport}>
                  <ScrollArea.Content className={styles.ScrollContent}>
                    <MotionPopup
                      initial={{ opacity: 0, scale: 1.02, y: -3 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.02, y: -3 }}
                      transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                      className={styles.Popup}
                      initialFocus={true}
                    >
                      <header className={styles.HeaderSection}>
                        <div className={styles.HeadingWrapper}>
                          <Dialog.Title
                            render={<h1 />}
                            className={styles.Heading}
                          >
                            {title}
                          </Dialog.Title>

                          <VisuallyHidden>
                            <button aria-hidden={true} />
                            /* Base UI встановлює автофокус на перший
                            інтерактивний елемент в межах діалогу. У більшості
                            випадках це добре. Але якщо вміст діалогу не влізе
                            на весь екран, це призведе до того, що діалог
                            відрендериться одразу в самому низу. Тому що кнопка
                            закриття діалогу - це єдиний інтерактивний елемент
                            за замовчуванням, і він знаходиться в самому низу
                            діалогу, з дизайнерських мотивів. */
                          </VisuallyHidden>
                        </div>
                        <Separator
                          orientation="horizontal"
                          className={styles.Separator}
                        />
                      </header>
                      <main>
                        <MDX markdown={content} mdast={mdast} />
                      </main>
                      <footer className={styles.FooterSection}>
                        <Separator
                          orientation="horizontal"
                          className={styles.Separator}
                        />
                        <div className={styles.FooterContents}>
                          <Dialog.Close
                            render={<MotionButton />}
                            className={clsx(styles.CloseButton, 'Gradient')}
                          >
                            Закрити
                          </Dialog.Close>
                        </div>
                      </footer>
                    </MotionPopup>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className={styles.Scrollbar}>
                  <ScrollArea.Thumb className={styles.ScrollbarThumb} />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </Dialog.Viewport>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default HelperDialog
