import { SystemFolderType } from '@/generated/prisma/enums'
import { api } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import { BOOKMARK_SYSTEM_FOLDERS_DATA } from '@/lib/constants'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { addNewFolderSchema } from '@/schemas/bookmarks'
import {
  teamsQueries,
  TitlePreviewData,
  titlesQueries,
} from '@/services/queries'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, useTransition } from 'react'

export interface AddToBookmartkProps {
  bookmarkFolders: TitlePreviewData['bookmarkFolders']
  activeFolder: TitlePreviewData['activeFolder']
  titleId: string
}

export function useAddToBookmarks({
  activeFolder,
  bookmarkFolders,
  titleId,
}: AddToBookmartkProps) {
  const [isUpdating, startTransition] = useTransition()
  const [isEnterMode, setIsEnterMode] = useState(false)
  const [folderName, setFolderName] = useState('')
  const { data, isPending: isPendingSessionData } = authClient.useSession()
  const queryClient = useQueryClient()

  const newFolderFieldRef = useRef<HTMLInputElement>(null)

  const isLoggedIn = Boolean(data)

  function handleAddNewFolder() {
    if (isUpdating) return

    const parsedResult = addNewFolderSchema.safeParse({ name: folderName })

    if (!parsedResult.success) {
      return showTimedToast({
        type: 'warning',
        title: 'Попередження',
        description: parsedResult.error.issues[0].message,
      })
    }

    startTransition(async () => {
      const { data: successMessage, error } = await api().bookmarks[
        'custom-folder'
      ].post({
        name: parsedResult.data.name,
      })

      if (error) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 422) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: error.value.message,
          })
        } else if (error.status === 403 || error.status === 404) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: error.value,
          })
        } else {
          showTimedToast({
            type: 'error',
            title: 'Помилка',
            description: error.value,
          })
        }
        return
      }

      await queryClient.invalidateQueries({
        queryKey: titlesQueries.titlePreview(titleId).queryKey,
      })

      setFolderName('')
      setIsEnterMode(false)

      showTimedToast({
        type: 'success',
        title: 'Успіх',
        description: successMessage,
      })
    })
  }

  function handleDeleteBookmark() {
    if (!activeFolder) return

    startTransition(async () => {
      const { error } = await api().bookmarks.delete({
        titleId,
      })

      if (error) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 404) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: error.value,
          })
        } else if (error.status === 500) {
          showTimedToast({
            type: 'error',
            title: 'Помилка',
            description: error.value,
          })
        }
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: titlesQueries.titlePreview(titleId).queryKey,
        }),

        /*
         * Має бути зміненним коли маршрут отримання творів
         * для компонента TitleDefaultCard стане загальним,
         * а не лише для творів команди
         * */
        queryClient.invalidateQueries({
          queryKey: teamsQueries.all,
        }),
      ])
    })
  }

  function handleSelect(folderId: string) {
    if (!isLoggedIn) {
      return showAuthToast()
    }

    if (folderId === activeFolder?.id) return

    startTransition(async () => {
      const { error } = await api().bookmarks.upsert.post({
        titleId,
        folderId,
      })

      if (error) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 404) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: error.value,
          })
        } else if (error.status === 500) {
          showTimedToast({
            type: 'error',
            title: 'Помилка',
            description: error.value,
          })
        }
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: titlesQueries.titlePreview(titleId).queryKey,
        }),

        /*
         * Має бути зміненним коли маршрут отримання творів
         * для компонента TitleDefaultCard стане загальним,
         * а не лише для творів команди
         * */
        queryClient.invalidateQueries({
          queryKey: teamsQueries.all,
        }),
      ])
    })
  }

  function handleAddToPlans() {
    if (!isLoggedIn) {
      return showAuthToast()
    }

    const planToReadFolder = bookmarkFolders?.find(
      (folder) => folder.systemType === 'PLAN_TO_READ',
    )

    if (!planToReadFolder) {
      return showTimedToast(
        {
          type: 'error',
          title: 'Помилка',
          description: `Список "${
            BOOKMARK_SYSTEM_FOLDERS_DATA[SystemFolderType.PLAN_TO_READ].label
          }" не знайдено`,
        },
        4000,
      )
    }

    startTransition(async () => {
      const { error } = await api().bookmarks.upsert.post({
        titleId,
        folderId: planToReadFolder.id,
      })

      if (error) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 404) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: error.value,
          })
        } else if (error.status === 500) {
          showTimedToast({
            type: 'error',
            title: 'Помилка',
            description: error.value,
          })
        }
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: titlesQueries.titlePreview(titleId).queryKey,
        }),

        /*
         * Має бути зміненним коли маршрут отримання творів
         * для компонента TitleDefaultCard стане загальним,
         * а не лише для творів команди
         * */
        queryClient.invalidateQueries({
          queryKey: teamsQueries.all,
        }),
      ])
    })
  }

  function clear() {
    setIsEnterMode(false)
    setFolderName('')
  }

  return {
    isUpdating,
    isEnterMode,
    setIsEnterMode,
    folderName,
    setFolderName,
    isLoggedIn,
    isPendingSessionData,
    newFolderFieldRef,
    handleAddNewFolder,
    handleDeleteBookmark,
    handleSelect,
    handleAddToPlans,
    clear,
  }
}
