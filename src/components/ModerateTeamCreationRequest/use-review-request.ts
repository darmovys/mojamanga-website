import { Api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { teamsMutations } from '@/services/mutations'
import { teamsQueries } from '@/services/queries'
import { Treaty } from '@elysiajs/eden'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

type AnyEndpointError = Treaty.Error<
  | Api['teams']['approve-team-request']['patch']
  | Api['teams']['revise-team-request']['patch']
  | Api['teams']['decline-team-request']['delete']
>

type ReviewDialogType = 'approve' | 'revise' | 'decline' | null

export function useReviewRequest(teamId: string) {
  const [activeDialog, setActiveDialog] = useState<ReviewDialogType>(null)
  const [message, setMessage] = useState('')

  const { data } = useSuspenseQuery(teamsQueries.getTeamRequest(teamId))

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
    navigate({ to: '/moderation', search: { type: 'teams' } })
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
    ...teamsMutations.approve(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const reviseMutation = useMutation({
    ...teamsMutations.revise(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const declineMutation = useMutation({
    ...teamsMutations.decline(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  return {
    data,
    isPending:
      approveMutation.isPending ||
      reviseMutation.isPending ||
      declineMutation.isPending,
    handleApprove: () => approveMutation.mutate(teamId),
    handleRevise: () => reviseMutation.mutate({ id: teamId, message }),
    handleDecline: () =>
      declineMutation.mutate({
        id: teamId,
        message,
        coverUrl: data.coverUrl,
        backgroundUrl: data.backgroundUrl,
      }),
    approveMutation,
    reviseMutation,
    declineMutation,
    activeDialog,
    setActiveDialog,
    message,
    setMessage,
    closeDialog,
  }
}
