import { Toast } from '@base-ui/react/toast'

export const toastManager = Toast.createToastManager()

export type ToastType = 'success' | 'error' | 'warning' | 'auth-warning'

type OriginalToastOptions = Parameters<typeof toastManager.add>[0]

export interface ToastData {
  animateTrigger?: number
  isUpdate?: boolean
}

export interface AppToastOptions extends Omit<
  OriginalToastOptions,
  'type' | 'data'
> {
  type: ToastType
  data?: ToastData
}

export const showToast = (options: AppToastOptions) => {
  return toastManager.add(options as OriginalToastOptions)
}

/**
 * Закриває тост через заданий час незалежно від активності користувача.
 * Base UI призупиняє вбудований таймер при відсутності взаємодії,
 * тому використовуємо timeout: 0 + власний setTimeout.
 */
export const showTimedToast = (options: AppToastOptions, duration = 3000) => {
  const id = showToast({ ...options, timeout: 0 })
  setTimeout(() => toastManager.close(id), duration)
}

let activeAuthToastId: string | null = null

export const showAuthToast = () => {
  const timestamp = Date.now()

  if (activeAuthToastId) {
    toastManager.update(activeAuthToastId, {
      data: { animateTrigger: timestamp, isUpdate: true },
    })
    return
  }

  activeAuthToastId = showToast({
    type: 'auth-warning',
    title: 'Необхідна авторизація',
    description: 'Увійдіть, щоб продовжити.',
    timeout: 0,
    data: { animateTrigger: timestamp, isUpdate: false },
    onClose: () => {
      activeAuthToastId = null
    },
  })
}
