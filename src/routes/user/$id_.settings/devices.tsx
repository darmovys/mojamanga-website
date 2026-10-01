import {
  DevicesSection,
  DevicesSectionSkeleton,
} from '@/components/UserSettings/_components'
import { usersQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/devices')({
  component: DevicesSection,
  pendingComponent: DevicesSectionSkeleton,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      usersQueries.getUserSessions(params.id),
    )
  },
})
