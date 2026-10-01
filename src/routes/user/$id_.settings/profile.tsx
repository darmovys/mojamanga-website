import {
  ProfileSection,
  ProfileSectionSkeleton,
} from '@/components/UserSettings/_components'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/profile')({
  component: ProfileSection,
  pendingComponent: ProfileSectionSkeleton,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserProfileSettingsInfo(params.id),
    )
  },
})
