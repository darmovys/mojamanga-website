import { TitleFieldName } from '@/generated/prisma/enums'
import { Api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { titlesMutations } from '@/services/mutations'
import { teamsQueries, titlesQueries } from '@/services/queries'
import { Treaty } from '@elysiajs/eden'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

type AnyEndpointError = Treaty.Error<
  | Api['titles']['approve-title-request']['patch']
  | Api['titles']['revise-title-request']['patch']
  | Api['titles']['decline-title-request']['delete']
>

type ReviewDialogType = 'approve' | 'revise' | 'decline' | null

export function useReviewRequest(titleId: string) {
  const [activeDialog, setActiveDialog] = useState<ReviewDialogType>(null)
  const [message, setMessage] = useState('')

  const { data } = useSuspenseQuery(
    titlesQueries.getTitleAddingRequest(titleId),
  )

  const serverLockedFields = data.lockedFields

  const [lockedFields, setLockedFields] = useState<TitleFieldName[]>(
    serverLockedFields ?? [],
  )

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const closeDialog = () => {
    setActiveDialog(null)
    setMessage('')
  }

  function handleMutationSuccess() {
    closeDialog()
    queryClient.invalidateQueries({ queryKey: teamsQueries.lists() })
    showTimedToast(
      { type: 'success', title: 'Успіх', description: 'Запит розглянуто' },
      4000,
    )
    navigate({ to: '/moderation', search: { type: 'titles' } })
  }

  function handleMutationError(error: AnyEndpointError) {
    switch (error.status) {
      case 422:
        showTimedToast(
          {
            type: 'warning',
            title: 'Помилка',
            description: error.value.message,
          },
          4000,
        )
        break
      case 401:
        showAuthToast()
        break
      case 404:
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: error.value,
          },
          4000,
        )
        navigate({ to: '/moderation', search: { type: 'titles' } })
        break
      case 409:
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: error.value,
          },
          4000,
        )
        navigate({ to: '/moderation', search: { type: 'titles' } })
        break
      default:
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: error.value,
          },
          4000,
        )
    }
  }

  const approveMutation = useMutation({
    ...titlesMutations.approve(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const reviseMutation = useMutation({
    ...titlesMutations.revise(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const declineMutation = useMutation({
    ...titlesMutations.decline(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  return {
    data,
    isPending:
      approveMutation.isPending ||
      reviseMutation.isPending ||
      declineMutation.isPending,
    handleApprove: () => approveMutation.mutate(titleId),
    handleRevise: () =>
      reviseMutation.mutate({ id: titleId, message, lockedFields }),
    handleDecline: () =>
      declineMutation.mutate({
        id: titleId,
        message,
        coverUrl: data.currentVersion.coverUrl,
        backgroundUrl: data.currentVersion.backgroundUrl,
      }),
    approveMutation,
    reviseMutation,
    declineMutation,
    activeDialog,
    setActiveDialog,
    message,
    setMessage,
    serverLockedFields,
    lockedFields,
    setLockedFields,
    closeDialog,
  }
}
