import ProfileSection from '@/components/UserSettings/ProfileSection'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/profile')({
  component: ProfileSection,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserProfileSettingsInfo(params.id),
    )
  },
})
