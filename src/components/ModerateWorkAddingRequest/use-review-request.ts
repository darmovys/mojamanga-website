import { Api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { teamsMutations } from '@/services/mutations'
import { teamsQueries, worksQueries } from '@/services/queries'
import { Treaty } from '@elysiajs/eden'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

type AnyEndpointError = Treaty.Error<
  | Api['teams']['approve-team-request']['patch']
  | Api['teams']['revise-team-request']['patch']
  | Api['teams']['decline-team-request']['delete']
>

export function useReviewRequest(workId: string) {
  const { data } = useSuspenseQuery(worksQueries.getWorkAddingRequest(workId))
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  function handleMutationSuccess() {
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

  const isPending =
    approveMutation.isPending ||
    reviseMutation.isPending ||
    declineMutation.isPending

  function handleApprove() {
    approveMutation.mutate(workId)
  }

  function handleRevise(message: string) {
    reviseMutation.mutate({ id: workId, message })
  }

  function handleDecline(message: string) {
    declineMutation.mutate({
      id: workId,
      message,
      coverUrl: data.currentVersion.coverImage,
      backgroundUrl: data.currentVersion.backgroundImage,
    })
  }

  return {
    data,
    isPending,
    handleApprove,
    handleRevise,
    handleDecline,
    approveMutation,
    reviseMutation,
    declineMutation,
  }
}
