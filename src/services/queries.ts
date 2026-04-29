import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const authQueries = {
  all: ['auth'],
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all, 'user'],
      queryFn: async () => {
        const response = await api().user_session.get()

        if (response.error) {
          throw response.error
        }

        return response.data
      },
    }),
}

const fetchPendingTeams = async (page: number) => {
  const response = await api().teams['get-pending-teams'].get({ query: { page } })
  if (response.error) throw response.error
  return response.data
}

export type PendingTeam = NonNullable<
  Awaited<ReturnType<typeof fetchPendingTeams>>
>['teams'][number]

export const teamsQueries = {
  all: ['teams'] as const,
  lists: () => [...teamsQueries.all, 'lists'] as const,
  pendingTeams: (page: number) =>
    queryOptions({
      queryKey: [...teamsQueries.lists(), 'pending', page] as const,
      queryFn: () => fetchPendingTeams(page),
    }),
}