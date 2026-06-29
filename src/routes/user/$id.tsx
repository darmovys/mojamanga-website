import UserProfile from '@/components/UserProfile'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id')({
  component: UserProfile,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserInfo(params.id),
    )
  },
})
