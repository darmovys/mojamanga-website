import TeamsSection, {
  TeamsSectionSkeleton,
} from '@/components/UserProfile/TeamsSection'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/teams')({
  component: TeamsSection,
  pendingComponent: TeamsSectionSkeleton,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserTeams(params.id),
    )
  },
})
