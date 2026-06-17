import { showTimedToast } from '@/lib/toast'
import { useCallback, useRef, useState } from 'react'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean>

interface UseCopyToClipboardOptions {
  resetIsCopiedStateAfter?: number // мс, default 2000
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const { resetIsCopiedStateAfter = 2000 } = options

  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [isCopied, setIsCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        showTimedToast({
          type: 'error',
          title: 'Ваш браузер не підтримує копіювання',
        })
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopiedText(text)

        // Скидаємо попередній таймер, якщо користувач клікнув ще раз
        if (timerRef.current) clearTimeout(timerRef.current)

        setIsCopied(true)
        timerRef.current = setTimeout(() => {
          setIsCopied(false)
          timerRef.current = null
        }, resetIsCopiedStateAfter)

        return true
      } catch (error) {
        console.warn('Не вдалося здійснити копіювання', error)
        setCopiedText(null)
        setIsCopied(false)
        return false
      }
    },
    [resetIsCopiedStateAfter],
  )

  return { copiedText, copy, isCopied }
}
