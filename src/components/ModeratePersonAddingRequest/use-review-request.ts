import { Api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { peopleMutations } from '@/services/mutations'
import { peopleQueries } from '@/services/queries'
import { Treaty } from '@elysiajs/eden'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

type AnyEndpointError = Treaty.Error<
  | Api['people']['approve-person-request']['patch']
  | Api['people']['decline-person-request']['delete']
>

export function useReviewRequest(teamId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  function handleMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: peopleQueries.lists() })
    showTimedToast(
      { type: 'success', title: 'Успіх', description: 'Запит розглянуто' },
      4000,
    )
    navigate({ to: '/moderation', search: { type: 'people' } })
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
    ...peopleMutations.approve(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const declineMutation = useMutation({
    ...peopleMutations.decline(),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const isPending = approveMutation.isPending || declineMutation.isPending

  function handleApprove() {
    approveMutation.mutate(teamId)
  }

  function handleDecline(message: string) {
    declineMutation.mutate({ id: teamId, message })
  }

  return {
    isPending,
    handleApprove,
    handleDecline,
    approveMutation,
    declineMutation,
  }
}
