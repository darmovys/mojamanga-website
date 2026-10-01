import {
  SecuritySection,
  SecuritySectionSkeleton,
} from '@/components/UserSettings/_components'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/security')({
  component: SecuritySection,
  pendingComponent: SecuritySectionSkeleton,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserSecuritySettingsInfo(params.id),
    )
  },
})
