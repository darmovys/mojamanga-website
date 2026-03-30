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
