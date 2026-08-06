import {
  TitlesRequests,
  TitlesRequestsSkeleton,
} from '@/components/UserRequests/TitlesRequests'
import { userTitlesRequestsSchema } from '@/schemas/users'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests/titles')({
  component: TitlesRequests,
  pendingComponent: TitlesRequestsSkeleton,
  validateSearch: userTitlesRequestsSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, params: { id }, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserTitlesRequests(id, search.status),
    )
  },
})
