import UserTeamsSection, {
  UserTeamsSectionSkeleton,
} from '@/components/UserTeamsSection'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/teams')({
  component: UserTeamsSection,
  pendingComponent: UserTeamsSectionSkeleton,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserTeams(params.id),
    )
  },
})
