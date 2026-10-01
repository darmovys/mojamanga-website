import {
  TeamsRequests,
  TeamsRequestsSkeleton,
} from '@/components/UserRequests/_components'
import { userTeamsRequestsSchema } from '@/schemas/users'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests/teams')({
  component: TeamsRequests,
  pendingComponent: TeamsRequestsSkeleton,
  validateSearch: userTeamsRequestsSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, params: { id }, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserTeamsRequests(id, search.status),
    )
  },
})
