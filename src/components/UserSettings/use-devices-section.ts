import { getRouteApi } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { authQueries, usersQueries } from '@/services/queries'
import { useTransition, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'

const routeApi = getRouteApi('/user/$id_/settings/devices')

export function useDevicesSection() {
  const { id } = routeApi.useParams()
  const { data: allDevices } = useSuspenseQuery(
    usersQueries.getUserSessions(id),
  )
  const [isDialogShown, setIsDialogShown] = useState(false)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const currentDevice = allDevices.find((d) => d.isCurrent)
  const otherDevices = allDevices.filter((d) => !d.isCurrent)

  function handleRevokeOtherSessions() {
    setIsDialogShown(false)
    startTransition(async () => {
      const { error } = await authClient.revokeOtherSessions()
      if (error) {
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: error.message ?? 'Невідома помилка',
          },
          4000,
        )
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersQueries.all }),
        queryClient.invalidateQueries({ queryKey: authQueries.all }),
      ])
    })
  }

  function handleRevokeSession(token: string) {
    startTransition(async () => {
      const { error } = await authClient.revokeSession({ token })

      if (error) {
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: error.message ?? 'Невідома помилка',
          },
          4000,
        )
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersQueries.all }),
        queryClient.invalidateQueries({ queryKey: authQueries.all }),
      ])
    })
  }

  return {
    allDevices,
    currentDevice,
    otherDevices,
    isDialogShown,
    setIsDialogShown,
    handleRevokeOtherSessions,
    handleRevokeSession,
    isPending,
  }
}
