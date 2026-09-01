import TeamProfile from '@/components/TeamProfile'
import { teamsQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/$id/')({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      teamsQueries.teamProfile(params.id),
    )
  },
  component: TeamProfile,
})
