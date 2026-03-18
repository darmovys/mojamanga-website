import { Toast, type ToastObject } from '@base-ui/react/toast'
import styles from './AppToasts.module.scss'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@base-ui/react'
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  TriangleAlert,
  X,
} from 'lucide-react'
import { motion, AnimatePresence, useAnimate } from 'motion/react'
import { useEffect } from 'react'
import clsx from 'clsx'
import { toastManager, type ToastData, type ToastType } from '@/lib/toast'

interface ToastItemProps {
  toast: ToastObject<ToastData>
}

function ToastItem({ toast }: ToastItemProps) {
  const [scope, animate] = useAnimate()
  const navigate = useNavigate()

  const isAuth = toast.type === 'auth-warning'
  const animateTrigger = toast.data?.animateTrigger
  const isUpdate = toast.data?.isUpdate

  useEffect(() => {
    if (isAuth && isUpdate && animateTrigger) {
      animate(
        scope.current,
        { rotate: [-2, 2, -2, 2, -2, 2, 0] },
        // { x: [-4, 4, -4, 4, -4, 4, 0] },
        { duration: 0.4, ease: 'easeInOut' },
      )
    }
  }, [animateTrigger])

  return (
    <Toast.Root
      render={
        <motion.div
          layout
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          drag="x"
          dragConstraints={{
            left: 0,
            right: 60,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.1, ease: 'easeOut' },
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
        />
      }
      ref={scope}
      toast={toast}
      className={styles.ToastRoot}
      swipeDirection={'right'}
    >
      <Toast.Content className={styles.ToastContentWrapper}>
        <div className={styles.ToastContent}>
          <div className={styles.ToastInfoContainer}>
            <div className={styles.ToastInfoIconWrapper}>
              {toast.type === ('success' as ToastType) && (
                <CircleCheck size={20} />
              )}
              {toast.type === ('auth-warning' as ToastType) && (
                <CircleAlert size={20} />
              )}
              {toast.type === ('warning' as ToastType) && (
                <TriangleAlert size={20} />
              )}
              {toast.type === ('error' as ToastType) && <CircleX size={20} />}
            </div>
            <Toast.Title className={styles.ToastTitle} />
            <Toast.Description className={styles.ToastDescription} />
          </div>

          {isAuth && (
            <Button
              className={clsx(styles.ToastAuthButton, { Gradient: true })}
              onClick={() => {
                navigate({ to: '/login' })
                toastManager.close(toast.id)
              }}
            >
              Увійти
            </Button>
          )}
        </div>

        <Toast.Close className={styles.ToastCloseButton}>
          <X size={16} />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return (
    <AnimatePresence mode="sync">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast as ToastObject<ToastData>} />
      ))}
    </AnimatePresence>
  )
}

export default function AppToasts() {
  return (
    <Toast.Provider limit={5} toastManager={toastManager}>
      <Toast.Portal>
        <Toast.Viewport className={styles.ToastViewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
