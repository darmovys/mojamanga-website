import { useEffect, useState } from 'react'
import { JsonValue } from '../../content-collections'

export interface HelperData {
  title: string
  content: string
  mdast: JsonValue
}

/**
 * Універсальний хук для керування діалогом-підказкою
 * @param storageKey - унікальний ключ для localStorage (наприклад, 'seen_rules_page_x')
 * @param data - об'єкт з даними підказки (зазвичай з loaderData)
 */
export function useHelperDialog(storageKey?: string, data?: HelperData) {
  const [isHelperOpen, setIsHelperOpen] = useState(false)

  useEffect(() => {
    // Якщо немає ключа або даних — нічого не робимо
    if (!storageKey || !data) return

    // Перевіряємо, чи користувач вже бачив цю підказку
    const hasSeen = localStorage.getItem(storageKey)

    if (hasSeen !== 'true') {
      setIsHelperOpen(true)
    }
  }, [storageKey])

  const handleHelperOpenChange = (open: boolean) => {
    setIsHelperOpen(open)

    // Якщо діалог закривається, зберігаємо статус "бачив"
    if (!open && storageKey) {
      localStorage.setItem(storageKey, 'true')
    }
  }

  if (!data) {
    return undefined
  }

  return {
    title: data.title,
    content: data.content,
    mdast: data.mdast,
    isHelperOpen,
    setIsHelperOpen,
    handleHelperOpenChange,
  }
}
