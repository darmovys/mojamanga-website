import { api } from '@/lib/api-client'
import { queryOptions } from '@tanstack/react-query'

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
      staleTime: 1000 * 60 * 5,
    }),
}
