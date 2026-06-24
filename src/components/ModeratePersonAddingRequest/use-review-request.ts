import { Api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { peopleMutations } from '@/services/mutations'
import { peopleQueries } from '@/services/queries'
import { Treaty } from '@elysiajs/eden'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

type AnyEndpointError = Treaty.Error<
  | Api['people']['approve-person-request']['patch']
  | Api['people']['decline-person-request']['delete']
>

type ReviewDialogType = 'approve' | 'revise' | 'decline' | null

export function useReviewRequest(personId: string) {
  const [activeDialog, setActiveDialog] = useState<ReviewDialogType>(null)
  const [message, setMessage] = useState('')

  const { data } = useSuspenseQuery(peopleQueries.getPersonRequest(personId))

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const closeDialog = () => {
    setActiveDialog(null)
    setMessage('')
  }

  function handleMutationSuccess() {
    closeDialog()
    queryClient.invalidateQueries({ queryKey: peopleQueries.lists() })
    showTimedToast(
      { type: 'success', title: 'Успіх', description: 'Запит розглянуто' },
      4000,
    )
    navigate({ to: '/moderation', search: { type: 'people' } })
  }

  function handleMutationError(error: AnyEndpointError) {
    switch (error.status) {
      case 401:
        showAuthToast()
        break
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

  return {
    data,
    isPending: approveMutation.isPending || declineMutation.isPending,
    handleApprove: () => approveMutation.mutate(personId),
    handleDecline: () =>
      declineMutation.mutate({
        id: personId,
        message,
        coverUrl: data.coverUrl,
      }),
    approveMutation,
    declineMutation,
    activeDialog,
    setActiveDialog,
    message,
    setMessage,
    closeDialog,
  }
}
